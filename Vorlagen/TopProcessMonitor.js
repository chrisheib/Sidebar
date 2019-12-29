try{var xmlHttp = new XMLHttpRequest()}
catch (e){var xmlHttp = new ActiveXObject('Microsoft.XMLHTTP')}

var wshShell = new ActiveXObject("WScript.Shell");

var locator = new ActiveXObject("WbemScripting.SWbemLocator");
var objWMIService = locator.ConnectServer(null, "root\\cimv2");

var lngID;

System.Gadget.settingsUI = "settings.html";
System.Gadget.onSettingsClosed = settingsclosed;

document.onselectstart = function() {return false};

var factheight;
var numProcesses;
var refreshRate;
var timervar;
var updateTimerId;
var firstupdatetimer;
var size;
var warninguse;
var criticaluse;
var memorypersent;
var cycleflag;
var cyclepos;
var numcyclepos = 9;// important
var beginoffset;
var endoffset;
var hidetitleflag;
var hidecopyrightflag;
var hidetotalflag;
var dblclcaction;
var savechoicetodiskflag;
var autoscaleDPIflag;
var autoupdateflag;

var proc    = new Array();
var caction = new Array();

var oldProcesses;
var processes;
var twoDimRead  = new Array();
var twoDimWrite = new Array();
var PercentProcessorTime = new Array();
var PercentProcessorTimeold = new Array();
var Timestamp_Sys100NS = new Array();
var Timestamp_Sys100NSold = new Array();

//color settings
var cBgColor;
var cTitle;
var cServStr;
var cUsedEasy;
var cUsedMedium;
var cUsedHard;
var cErrMsg;
var cCopyright;
var cVersion;

var CPUusage;
var coreUsage;
var coreCount;
var TotalMemUsage;
var MEM = objWMIService.ExecQuery("SELECT TotalVirtualMemorySize, TotalVisibleMemorySize FROM Win32_OperatingSystem");
var RAMall = (new Enumerator(MEM)).item().TotalVisibleMemorySize * 1024;
var VIRall = (new Enumerator(MEM)).item().TotalVirtualMemorySize * 1024;

var updateavailable;
var showupdate;

function CheckUpdates(){
 if (!updateavailable) autoupdate();
 if (updateavailable && !showupdate) showupdate = true;
 updateTimerId = setTimeout("CheckUpdates()", 86400000);// Update once a day
}

function autoupdate(){
 var url = "http://www.myfavoritegadgets.info/monitors/TopProcessMonitor/TopProcessMonitorversioninfo.xml";
 xmlHttp.open("GET", url, false); //false mean call is synchronous
 xmlHttp.setRequestHeader("If-Modified-Since", "Sat, 1 Jan 2000 00:00:00 GMT"); //for non cached
 xmlHttp.send(null);
 if (xmlHttp.readyState == 4 && xmlHttp.status == 200){
  var newVersion = xmlHttp.responseXML.getElementsByTagName("version")[0].firstChild.nodeValue;
  var updateUrl = xmlHttp.responseXML.getElementsByTagName("url")[0].firstChild.nodeValue;
  // Compare and show message if a newer version is available.
   if (parseFloat(newVersion) > parseFloat(System.Gadget.version)){
   autoapdater.innerHTML = "<a id='ulink' href='" + updateUrl + "' style='text-decoration:none;color:" + cServStr +
   "' onclick='System.Gadget.close()' onmouseout='ulink.style.textDecoration=" + '"none"' + "' onmouseover='ulink.style.textDecoration=" +
   + '"underline"' + "'>" + mainlng[lngID][26] + "<strong>" + newVersion + "</strong>" + mainlng[lngID][27] + "</a>";
   updateavailable = true;
  }// if
 }// if
}

function settingsclosed(){
 clearTimeout(timervar);
 setlanguage(); //Important!!! before loadSettings()
 loadsettings();
 if (autoscaleDPIflag) getDPIsize(); //Important!!! After loadsettings()
 setupgadget();
 oldProcesses = getProcesses();
 try {oldProcesses.sort(SortProcessByID)}
 catch (e){}
 timervar = setTimeout("update()", 500);

 if (autoupdateflag){
  if (autoapdater.innerHTML == "") firstupdatetimer = setTimeout("CheckUpdates()", 5000);
 }
 else{
  clearTimeout(firstupdatetimer);
  clearTimeout(updateTimerId);
 }
}

function getDPIsize(){
 try{
  var getdefaultDPI = wshShell.RegRead("HKCU\\Control Panel\\Desktop\\LogPixels");
  size = parseInt((getdefaultDPI / 96) * 100) / 100;
  System.Gadget.Settings.write("SetSize", size);
 }
 catch (e){}
}

function setlanguage(){
 lngID = System.Gadget.Settings.read("LanguageId");
 if(lngID == ''){
  lngID = "0";
  System.Gadget.Settings.write("LanguageId", lngID);
 }
 gtitle.innerText = mainlng[lngID][0];
 hrline.style.width = tech[lngID][0];
 cycleproc.title = mainlng[lngID][1];
}

function loadsettings(){
 processmode = System.Gadget.Settings.read("ProcessMode");
 if(processmode == ''){
  processmode = "CPU";
  System.Gadget.Settings.write("ProcessMode", processmode);
 }

 numProcesses = System.Gadget.Settings.read("NumProcesses");
 if(numProcesses == ''){
  numProcesses = 5;
  System.Gadget.Settings.write("NumProcesses", numProcesses);
 }

 size = System.Gadget.Settings.read("SetSize");
 if (size == ''){
  size = "1";
  System.Gadget.Settings.write("SetSize", size);
 }

 autoscaleDPIflag = System.Gadget.Settings.read ("DPIautoscale");
 if (autoscaleDPIflag != "false"){
  autoscaleDPIflag = true;
  System.Gadget.Settings.write ("DPIautoscale", "true");
 }
 else{
  autoscaleDPIflag = false;
  System.Gadget.Settings.write ("DPIautoscale", "false");
 }

 refreshRate = System.Gadget.Settings.read("refreshtime");
 if(refreshRate == ''){
  refreshRate = 5000;
  System.Gadget.Settings.write("refreshtime", refreshRate);
 }

 dblclcaction = System.Gadget.Settings.read("dblclick");
 if (dblclcaction == ''){
  dblclcaction = "0";
  System.Gadget.Settings.write("dblclick", dblclcaction);
 }

 memorypersent = System.Gadget.Settings.read ("PersentInMemory");
 if (memorypersent != "true"){
  memorypersent = false;
  System.Gadget.Settings.write ("PersentInMemory", "false");
 }
 else{
  memorypersent = true;
  System.Gadget.Settings.write ("PersentInMemory", "true");
 }

 warninguse = System.Gadget.Settings.read("WarningUse");
 if(warninguse == ''){
  warninguse = "65";
  System.Gadget.Settings.write("WarningUse", warninguse);
 }

 criticaluse = System.Gadget.Settings.read("CriticalUse");
 if(criticaluse == ''){
  criticaluse = "90";
  System.Gadget.Settings.write("CriticalUse", criticaluse);
 }

 hidetitleflag = System.Gadget.Settings.read ("TitleHide");
 if (hidetitleflag != "true"){
  hidetitleflag = false;
  System.Gadget.Settings.write ("TitleHide", "false");
 }
 else{
  hidetitleflag = true;
  System.Gadget.Settings.write ("TitleHide", "true");
 }
 hidecopyrightflag = System.Gadget.Settings.read ("CopyrightHide");
 if (hidecopyrightflag != "true"){
  hidecopyrightflag = false;
  System.Gadget.Settings.write ("CopyrightHide", "false");
 }
 else{
  hidecopyrightflag = true;
  System.Gadget.Settings.write ("CopyrightHide", "true");
 }

 hidetotalflag = System.Gadget.Settings.read ("TotalHide");
 if (hidetotalflag != "true"){
  hidetotalflag = false;
  System.Gadget.Settings.write ("TotalHide", "false");
 }
 else{
  hidetotalflag = true;
  System.Gadget.Settings.write ("TotalHide", "true");
 }

 for (var i=1; i<=numcyclepos; i++){
  proc[i] = System.Gadget.Settings.read ("ProcCycle" + i);
  if (proc[i] != "true"){
   proc[i] = false;
   System.Gadget.Settings.write ("ProcCycle" + i, "false");
  }
  else{
   proc[i] = true;
   System.Gadget.Settings.write ("ProcCycle" + i, "true");
  }
 }

 for (var i=1; i<=numcyclepos; i++){
  switch(i){
   case 1:
   if (proc[1] == true) caction[1] = "CPU";
   else caction[1] = null;
   break;

   case 2:
   if (proc[2] == true) caction[2] = "Memory";
   else caction[2] = null;
   break;

   case 3:
   if (proc[3] == true) caction[3] = "Page";
   else caction[3] = null;
   break;

   case 4:
   if (proc[4] == true) caction[4] = "Virtual";
   else caction[4] = null;
   break;

   case 5:
   if (proc[5] == true) caction[5] = "IOBytes";
   else caction[5] = null;
   break;

   case 6:
   if (proc[6] == true) caction[6] = "Read";
   else caction[6] = null;
   break;

   case 7:
   if (proc[7] == true) caction[7] = "Write";
   else caction[7] = null;
   break;

   case 8:
   if (proc[8] == true) caction[8] = "TRead";
   else caction[8] = null;
   break;

   case 9:
   if (proc[9] == true) caction[9] = "TWrite";
   else caction[9] = null;
   break;
  } // end switch
 }// end for

 cycleflag = false;
 cyclepos  = 1;
 for (var i=1; i<=numcyclepos; i++){
  if (caction[i] != null) cycleflag = true;
 }

 if (cycleflag){
  for (var i=1; i<=numcyclepos; i++){
   if (caction[cyclepos] != null){
    processmode = caction[cyclepos];
    cyclepos++;
    if (cyclepos>numcyclepos) cyclepos = 1;
    break;
   }
   cyclepos++;
   if (cyclepos>numcyclepos) cyclepos = 1;
  }
 }

 autoupdateflag = System.Gadget.Settings.read ("AutoUpdate");
 if (autoupdateflag != "true"){
  autoupdateflag = false;
  System.Gadget.Settings.write ("AutoUpdate", "false");
 }
 else{
  autoupdateflag = true;
  System.Gadget.Settings.write ("AutoUpdate", "true");
 }

 //color settings
 cBgColor = System.Gadget.Settings.read("colBgColor");
 if (cBgColor == ''){
  cBgColor = "#262526";
  System.Gadget.Settings.write("colBgColor", cBgColor);
 }
 cTitle = System.Gadget.Settings.read("colTitle");
 if (cTitle == ''){
  cTitle = "#FFFFFF";
  System.Gadget.Settings.write("colTitle", cTitle);
 }

 cServStr = System.Gadget.Settings.read("colServStr");
 if (cServStr == ''){
  cServStr = "#FFCC00";
  System.Gadget.Settings.write("colServStr", cServStr);
 }

 cUsedEasy = System.Gadget.Settings.read("colUsedEasy");
 if (cUsedEasy == ''){
  cUsedEasy = "#7EE444";
  System.Gadget.Settings.write("colUsedEasy", cUsedEasy);
 }
 cUsedMedium = System.Gadget.Settings.read("colUsedMedium");
 if (cUsedMedium == ''){
  cUsedMedium = "#FFF62A";
  System.Gadget.Settings.write("colUsedMedium", cUsedMedium);
 }
 cUsedHard = System.Gadget.Settings.read("colUsedHard");
 if (cUsedHard == ''){
  cUsedHard = "#FF0000";
  System.Gadget.Settings.write("colUsedHard", cUsedHard);
 }

 cErrMsg = System.Gadget.Settings.read("colErrMsg");
 if (cErrMsg == ''){
  cErrMsg = "#FF0000";
  System.Gadget.Settings.write("colErrMsg", cErrMsg);
 }

 cCopyright = System.Gadget.Settings.read("colCopyright");
 if (cCopyright == ''){
  cCopyright = "#00CCFF";
  System.Gadget.Settings.write("colCopyright", cCopyright);
 }
 cVersion = System.Gadget.Settings.read("colVersion");
 if (cVersion == ''){
  cVersion = "#C0C0C0";
  System.Gadget.Settings.write("colVersion", cVersion);
 }
//color settings end
}

function loadsettingsfromfile(){
 var fs = new ActiveXObject("Scripting.FileSystemObject");
 var inifilename = System.Environment.getEnvironmentVariable("APPDATA") + "\\" + System.Gadget.name + "_Settings.ini";
 try {
  var inifile = fs.OpenTextFile(inifilename, 1); //1 read
   try {
    var tmp = inifile.ReadLine();
    tmp = inifile.ReadLine();
    if (tmp != ";purr purr meow") throw "old";

    lngID = inifile.ReadLine();
    System.Gadget.Settings.write("LanguageId", lngID);
    //color settings
    tmp = inifile.ReadLine();
    System.Gadget.Settings.write("sBgColorSelect", tmp);
    cBgColor = inifile.ReadLine();
    System.Gadget.Settings.write("colBgColor", cBgColor);
    tmp = inifile.ReadLine();
    System.Gadget.Settings.write("sTitColorSelect", tmp);
    cTitle = inifile.ReadLine();
    System.Gadget.Settings.write("colTitle", cTitle);
    tmp = inifile.ReadLine();
    System.Gadget.Settings.write("sServStrColorSelect", tmp);
    cServStr = inifile.ReadLine();
    System.Gadget.Settings.write("colServStr", cServStr);
    tmp = inifile.ReadLine();
    System.Gadget.Settings.write("sProcessEasyColorSelect", tmp);
    cUsedEasy = inifile.ReadLine();
    System.Gadget.Settings.write("colUsedEasy", cUsedEasy);
    tmp = inifile.ReadLine();
    System.Gadget.Settings.write("sProcessMediumColorSelect", tmp);
    cUsedMedium = inifile.ReadLine();
    System.Gadget.Settings.write("colUsedMedium", cUsedMedium);
    tmp = inifile.ReadLine();
    System.Gadget.Settings.write("sProcessHardColorSelect", tmp);
    cUsedHard = inifile.ReadLine();
    System.Gadget.Settings.write("colUsedHard", cUsedHard);
    tmp = inifile.ReadLine();
    System.Gadget.Settings.write("sErrMsgColorSelect", tmp);
    cErrMsg = inifile.ReadLine();
    System.Gadget.Settings.write("colErrMsg", cErrMsg);
    tmp = inifile.ReadLine();
    System.Gadget.Settings.write("sVersnColorSelect", tmp);
    cVersion = inifile.ReadLine();
    System.Gadget.Settings.write("colVersion", cVersion);
    tmp = inifile.ReadLine();
    System.Gadget.Settings.write("sCopyColorSelect", tmp);
    cCopyright = inifile.ReadLine();
    System.Gadget.Settings.write("colCopyright", cCopyright);
    //color settings end

    size = inifile.ReadLine();
    System.Gadget.Settings.write("SetSize", size);
    numProcesses = inifile.ReadLine();
    System.Gadget.Settings.write("NumProcesses", numProcesses);
    warninguse = inifile.ReadLine();
    System.Gadget.Settings.write("WarningUse", warninguse);
    criticaluse = inifile.ReadLine();
    System.Gadget.Settings.write("CriticalUse", criticaluse);
    memorypersent = inifile.ReadLine();
    System.Gadget.Settings.write ("PersentInMemory", memorypersent);
    hidetitleflag = inifile.ReadLine();
    System.Gadget.Settings.write ("TitleHide", hidetitleflag);
    hidecopyrightflag = inifile.ReadLine();
    System.Gadget.Settings.write ("CopyrightHide", hidecopyrightflag);
    hidetotalflag = inifile.ReadLine();
    System.Gadget.Settings.write ("TotalHide", hidetotalflag);
    autoupdateflag = inifile.ReadLine();
    System.Gadget.Settings.write ("AutoUpdate", autoupdateflag);
    dblclcaction = inifile.ReadLine();
    System.Gadget.Settings.write("dblclick", dblclcaction);
    autoscaleDPIflag = inifile.ReadLine();
    System.Gadget.Settings.write ("DPIautoscale", autoscaleDPIflag);
    savechoicetodiskflag = inifile.ReadLine();
    System.Gadget.Settings.write ("SaveCycleToDisk", savechoicetodiskflag);
    for (var i=1; i<=numcyclepos; i++){
     tmp = inifile.ReadLine();
     if (savechoicetodiskflag == "true") System.Gadget.Settings.write ("ProcCycle" + i, tmp); //Important. "true" is a string
    }
   }//end try 2
  
   finally {inifile.Close()}
 }//end try 1   
 
 catch (e) {}

 finally {fs = null}
}

function init(){
 try{counterstatus = wshShell.RegRead("HKLM\\SYSTEM\\CurrentControlSet\\Services\\PerfOS\\Performance\\Disable Performance Counters")}
 catch (e){counterstatus = 0}
 if (counterstatus){
  var errhtml = '<g:background id="background" src="images/background.png">';
  errhtml += '<div id="mainsquare" style="position:absolute"></div>';
  errhtml += '<div style="position:absolute;top:6px;width:100%;text-align:center;font-size:12px;color:#FFFFFF;font-weight:bold">' + mainlng[0][0] + '</div>';
  errhtml += '<div style="position:absolute;top:16px;width:100%"><hr align="center" width="' + tech[0] +'" color="#808080"></div>';
  errhtml += '<div style="position:absolute;top:26px;width:100%;text-align:center"><img src="images/alert.png" style="width:16;height:16" /></div>';
  errhtml += '<div style="position:absolute;top:42px;width:100%;font-size:12px;text-align:center;color:#FF0000;font-weight:bold">' + 'PerfOS is disabled!!!<br>' +
  '<a style="color:#FF0000" href="http://www.myfavoritegadgets.info/counters/NoPerfcounters.html" onclick="System.Gadget.close()" target="_blank">Click HERE</a></div>';
  errhtml += '<div id="advertis" style="position:absolute;width:100%;top:78px;left:10px;font-size:10px">' +
  '<a class="ads" style="color:#00CCFF" href="http://www.myfavoritegadgets.info/" target="_blank">&copy; 2012 by Igogo</a></div>';
  errhtml += '<div id="versionnumber" style="position:absolute;font-size:9px;top:78px;left:0px;width:120px;text-align:right;' +
  'color:#C0C0C0">v' + System.Gadget.version + '</div>';
  document.body.innerHTML = errhtml + "</g:background>";
  document.body.style.width = 130;
  background.style.width = 130;
  document.body.style.height = 98;
  background.style.height = 98;
  mainsquare.style.top = 5;
  mainsquare.style.left = 5;
  mainsquare.style.width = 120;
  mainsquare.style.height = 88;
  mainsquare.style.background = "#262526";
  System.Gadget.settingsUI = "";
  return;
 }
 loadsettingsfromfile(); //don't move this line!!!
 setlanguage(); //Important!!! before loadSettings()
 loadsettings();
 if (autoscaleDPIflag) getDPIsize(); //Important!!! After loadsettings()
 setupgadget();
 finalsetup(1);
 proctitle.innerText = mainlng[lngID][2];
 oldProcesses = getProcesses();
 try {oldProcesses.sort(SortProcessByID)}
 catch (e){}

 //for initialize usage percentage
 try{
  coreCount = 0;
  var CPUcounters = objWMIService.ExecQuery("SELECT Name,PercentProcessorTime,Timestamp_Sys100NS from Win32_PerfRawData_PerfOS_Processor");
  for (var i=0; i<CPUcounters.Count; i++){
   if (CPUcounters.ItemIndex(i).Name.indexOf("_Total") != -1) continue;
   PercentProcessorTimeold[i] = CPUcounters.ItemIndex(i).PercentProcessorTime;
   Timestamp_Sys100NSold[i] = CPUcounters.ItemIndex(i).Timestamp_Sys100NS;
   coreCount++;
  }
 }
 catch (e){
  var errhtml = '<g:background id="background" src="images/background.png">';
  errhtml += '<div id="mainsquare" style="position:absolute"></div>';
  errhtml += '<div style="position:absolute;top:6px;width:100%;text-align:center;font-size:12px;color:#FFFFFF;font-weight:bold">' + mainlng[0][0] + '</div>';
  errhtml += '<div style="position:absolute;top:16px;width:100%"><hr align="center" width="' + tech[0] +'" color="#808080"></div>';
  errhtml += '<div style="position:absolute;top:26px;width:100%;text-align:center"><img src="images/alert.png" style="width:16;height:16" /></div>';
  errhtml += '<div style="position:absolute;top:42px;width:100%;font-size:12px;text-align:center;color:#FF0000;font-weight:bold">' + 'Broken WMI<br>' +
  '<a style="color:#FF0000" href="http://www.myfavoritegadgets.info/counters/BrokenWMI.html" onclick="System.Gadget.close()" target="_blank">Click HERE</a></div>';
  errhtml += '<div id="advertis" style="position:absolute;width:100%;top:78px;left:10px;font-size:10px">' +
  '<a class="ads" style="color:#00CCFF" href="http://www.myfavoritegadgets.info/" target="_blank">&copy; 2012 by Igogo</a></div>';
  errhtml += '<div id="versionnumber" style="position:absolute;font-size:9px;top:78px;left:0px;width:120px;text-align:right;' +
  'color:#C0C0C0">v' + System.Gadget.version + '</div>';
  document.body.innerHTML = errhtml + "</g:background>";
  document.body.style.width = 130;
  background.style.width = 130;
  document.body.style.height = 98;
  background.style.height = 98;
  mainsquare.style.top = 5;
  mainsquare.style.left = 5;
  mainsquare.style.width = 120;
  mainsquare.style.height = 88;
  mainsquare.style.background = "#262526";
  System.Gadget.settingsUI = "";
  return;
 }

 timervar = setTimeout("update()", 300);
 autoapdater.innerHTML = ""; //Important;
 updateavailable = false;
 showupdate = false;
 if (autoupdateflag) firstupdatetimer = setTimeout("CheckUpdates()", 5000);
}

function setupgadget(){
 //background section
 //fixed bug with 100% width BEFORE set real width in background section
 document.body.style.width = parseInt(130 * size);
 background.style.width = parseInt(130 * size);

 gtitle.style.top = parseInt(6 * size);
 gline.style.top = parseInt(16 * size);
 proctitle.style.top = parseInt(26 * size);
 cycleproc.style.top = parseInt(25 * size);
 gadgetbody.style.top = parseInt(36 * size)

 //color settings
 gtitle.style.color = cTitle;
 proctitle.style.color = cServStr;
 copyright.style.color = cCopyright;
 versionnumber.style.color = cVersion;

 //left section
 proctitle.style.left = parseInt(7 * size); 
 gadgetbody.style.left = parseInt(7 * size);
 advertis.style.left = parseInt(10 * size);

 //font-size section
 gtitle.style.fontSize = parseInt(12 * size);
 proctitle.style.fontSize = parseInt(9 * size);
 gadgetbody.style.fontSize = parseInt(9 * size);
 advertis.style.fontSize = parseInt(10 * size);
 versionnumber.style.fontSize = parseInt(9 * size);
 autoapdater.style.fontSize = parseInt(9 * size);

 //width section
 versionnumber.style.width = parseInt(120 * size);
 cycleproc.style.width = parseInt(123 * size);

 //picture section
 cycleimg.style.width = parseInt(10 * size);
 cycleimg.style.height = parseInt(13 * size);
}

function finalsetup(num){
 beginoffset = 26;
 endoffset = 20;
 gtitle.style.visibility = "visible";
 gline.style.visibility = "visible";
 advertis.style.visibility = "visible";
 versionnumber.style.visibility = "visible";
 num++;

 var k;
 if (hidetitleflag){
  //title
  gtitle.style.visibility = "hidden";
  gline.style.visibility = "hidden";
  beginoffset = 6;
  proctitle.style.top = parseInt(6 * size);
  cycleproc.style.top = parseInt(5 * size);
  gadgetbody.style.top = parseInt(16 * size)
 }

 if (hidecopyrightflag){
  //copyright
  advertis.style.visibility = "hidden";
  versionnumber.style.visibility = "hidden";
  endoffset = 8;
 }
 else{
  advertis.style.top = parseInt((beginoffset + num * 10 + 2) * size);
  versionnumber.style.top = parseInt((beginoffset + num * 10 + 2) * size);
 } 
 
 factheight = beginoffset + num * 10 + endoffset;
 if (autoupdateflag && showupdate){
  autoapdater.style.top = parseInt((factheight - 6) * size);
  factheight += 12;
  autoapdater.style.visibility = "visible";
 }
 else autoapdater.style.visibility = "hidden";

 //background section
 document.body.style.height = parseInt(factheight * size);
 background.style.height = parseInt(factheight * size);
 document.body.style.width = parseInt(130 * size);
 background.style.width = parseInt(130 * size);
 if (num <= 20) background.src = "images/background" + num + ".png";
 else if (num < 40) background.src = "images/background23.png";
 else if (num < 76) background.src = "images/background24.png";
 else background.src = "images/background25.png";
 mainsquare.style.top = parseInt(5 * size); 
 mainsquare.style.left = parseInt(5 * size);  
 mainsquare.style.width =  parseInt((130 - 10) * size);
 mainsquare.style.height = parseInt((factheight - 10) * size);
 mainsquare.style.background = cBgColor;
}

function update(){
 var result = "";
 var resulttocopy = "";
 var lengthadd = 0;
 try{
  var processes = getProcesses();
  if(!processes) throw "no";
  if (processmode === "CPU"){
   var TopProcessInfo = getTopProcessesByCPU(processes, oldProcesses, numProcesses);
   try{
    var TopProcesses = TopProcessInfo.TopProcesses || [];
    var TotalTime = TopProcessInfo.TotalTime;
    for (var i=0; i<TopProcesses.length; i++){
     var process = TopProcesses[i];
     if (!process || process.ProcessId == null) continue;
     var PercentUsage = Math.round((process.TotalTime / TotalTime) * 10000) / 100;
     var ProcName = process.Name;
     if (ProcName.length > 18) ProcName = ProcName.substr(0,18) + "...";
     var pcolor;
     if (PercentUsage < warninguse) pcolor = cUsedEasy; //easy
     else if (PercentUsage > criticaluse) pcolor = cUsedHard; //hard
     else pcolor = cUsedMedium; //moderate
     resulttocopy += process.Name + " " + PercentUsage + "%\\n";
     result += "<tr style='color:" + pcolor + ";height:" + parseInt(10 * size) + "'><td style='width:" + parseInt(88 * size) + "px'>" +
     "<span style='cursor:help' title='" + process.Name + "\n" + "ID:" + process.ProcessId + mainlng[lngID][3] + process.Priority + mainlng[lngID][4] + process.ThreadCount + "'>" +
     ProcName + "</span></td><td style='text-align:right'>" + PercentUsage.toFixed(1) + "%</td></tr>";
    }//for
   }
   catch (e) {}
   CPUusage = 0;
   var CPUcounters = objWMIService.ExecQuery("SELECT PercentProcessorTime,Timestamp_Sys100NS from Win32_PerfRawData_PerfOS_Processor");
   for (var i=0; i<coreCount; i++){
    PercentProcessorTime[i] = CPUcounters.ItemIndex(i).PercentProcessorTime;
    Timestamp_Sys100NS[i] = CPUcounters.ItemIndex(i).Timestamp_Sys100NS;
    coreUsage = parseInt((1 - (PercentProcessorTime[i] - PercentProcessorTimeold[i])/(Timestamp_Sys100NS[i] - Timestamp_Sys100NSold[i])) * 100);
    if (coreUsage < 0) coreUsage = 0; //Warning! Don't remove this. Percentage can be negative value 
    CPUusage += coreUsage;
    PercentProcessorTimeold[i] = PercentProcessorTime[i];
    Timestamp_Sys100NSold[i] = Timestamp_Sys100NS[i];
   }
   CPUusage = Math.round(CPUusage / coreCount);
   resulttocopy = mainlng[lngID][5] + " " + CPUusage + "%" + "\\n" + resulttocopy;
   proctitle.innerHTML =  "<span onclick='copyText(" + '"' + resulttocopy + '"' + ")' style='cursor:pointer'>" + mainlng[lngID][5] + " " + CPUusage + "%" + "</span>"
   if (!hidetotalflag){
    lengthadd = 1;
    result += "<tr style='height:" + parseInt(10 * size) + "'><td colspan=2>" + GetTotal() + "</td></tr>";
   }
   gadgetbody.innerHTML = "<table style='width:" + parseInt(116 * size) + "px;font-size:" + parseInt(9 * size) + "px'>" + result + "</table>";
   finalsetup(TopProcesses.length + lengthadd);
  }//end if
 else
  if (processmode === "Memory"){
   try {processes.sort(SortProcessesByMemory)}
   catch (e){}
   var TopProcesses = processes.slice(0, numProcesses);
   try{
    for (var i=0; i<TopProcesses.length; i++){
     var process = TopProcesses[i];
     if (!process || process.ProcessId == null) continue;
     var memusage = process.WorkingSetSize;
     var ProcName = process.Name;
     if (ProcName.length > 15) ProcName = ProcName.substr(0,15) + "...";
     var pcolor;
     var memprct = memusage / RAMall * 100;
     if (memprct < warninguse) pcolor = cUsedEasy; //easy
     else if (memprct > criticaluse) pcolor = cUsedHard; //hard
     else pcolor = cUsedMedium; //moderate
     if (!memorypersent){
      result += "<tr style='color:" + cUsedEasy + ";height:" + parseInt(10 * size) + "'><td style='width:" + parseInt(80 * size) + "px'>" +
      "<span style='cursor:help' title='" + process.Name + "\n" + "ID:" + process.ProcessId + mainlng[lngID][3] + process.Priority + mainlng[lngID][4] + process.ThreadCount + "'>" +
      ProcName + "</span></td><td style='text-align:right'>" + formatBytes(memusage) + mainlng[lngID][24] + "</td></tr>";
     }
     else{
      result += "<tr style='color:" + pcolor + ";height:" + parseInt(10 * size) + "'><td style='width:" + parseInt(80 * size) + "px'>" +
      "<span style='cursor:help' title='ID:" + process.ProcessId + mainlng[lngID][3] + process.Priority + mainlng[lngID][4] + process.ThreadCount + "'>" +
      ProcName + "</span></td><td style='text-align:right'>" + memprct.toFixed(1) + "%</td></tr>";
     }  
    }//for
   }
   catch (e) {}
   var getmemory = objWMIService.ExecQuery("SELECT FreePhysicalMemory,TotalVisibleMemorySize FROM Win32_OperatingSystem");
   var RAMalltotal  = getmemory.ItemIndex(0).TotalVisibleMemorySize;
   var RAMfreetotal = getmemory.ItemIndex(0).FreePhysicalMemory;
   var RAMusedtotal = RAMalltotal - RAMfreetotal;
   TotalMemUsage = Math.round(RAMusedtotal / RAMalltotal * 100);

   proctitle.innerText = mainlng[lngID][6] + " " + TotalMemUsage + "%";
   if (!hidetotalflag){
    lengthadd = 1;
    result += "<tr style='height:" + parseInt(10 * size) + "'><td colspan=2>" + GetTotal() + "</td></tr>";
   }
   gadgetbody.innerHTML = "<table style='width:" + parseInt(116 * size) + "px;font-size:" + parseInt(9 * size) + "px'>" + result + "</table>";
   finalsetup(TopProcesses.length + lengthadd);
  }//end if
 else
  if (processmode === "IOBytes"){
   var TopProcessInfo = getTopProcessesByIOBytes(processes, oldProcesses, numProcesses);
   try{
    var TopProcesses = TopProcessInfo.TopProcesses || [];
    for(var i=0; i<TopProcesses.length; i++){
     var process = TopProcesses[i];	
	 var TotalBytesPerSec = process.TotalBytes / (refreshRate / 1000);
     var ProcName = process.Name;
     if (ProcName.length > 15) ProcName = ProcName.substr(0,15) + "...";
     result += "<tr style='color:" + cUsedEasy + ";height:" + parseInt(10 * size) + "'><td style='width:" + parseInt(70 * size) + "px'>" +
     "<span style='cursor:help' title='" + process.Name + "\n" + "ID:" + process.ProcessId + mainlng[lngID][3] + process.Priority + mainlng[lngID][4] + process.ThreadCount + "'>" +
     ProcName + "</span></td><td style='text-align:right'>" + formatBytes(TotalBytesPerSec) + mainlng[lngID][25] + "</td></tr>";
    }
   }
   catch (e) {}
   proctitle.innerText = mainlng[lngID][7];
   if (!hidetotalflag){
    lengthadd = 1;
    result += "<tr style='height:" + parseInt(10 * size) + "'><td colspan=2>" + GetTotal() + "</td></tr>";
   }
   gadgetbody.innerHTML = "<table style='width:" + parseInt(116*size) + "px;font-size:" + parseInt(9*size) + "px'>" + result + "</table>";
   finalsetup(TopProcesses.length + lengthadd);
  }//end if
 else
  if (processmode === "Read"){
   var TopProcessInfo = getTopProcessesByReadBytes(processes, oldProcesses, numProcesses);
   try{
    var TopProcesses = TopProcessInfo.TopProcesses || [];
    for(var i=0; i<TopProcesses.length; i++){
     var process = TopProcesses[i];	
	 var ReadBytesPerSec = process.ReadBytes1 / (refreshRate / 1000);
     var ProcName = process.Name;
     if (ProcName.length > 15) ProcName = ProcName.substr(0,15) + "...";
     result += "<tr style='color:" + cUsedEasy + ";height:" + parseInt(10 * size) + "'><td style='width:" + parseInt(70 * size) + "px'>" +
     "<span style='cursor:help' title='" + process.Name + "\n" + "ID:" + process.ProcessId + mainlng[lngID][3] + process.Priority + mainlng[lngID][4] + process.ThreadCount + "'>" +
     ProcName + "</span></td><td style='text-align:right'>" + formatBytes(ReadBytesPerSec) + mainlng[lngID][25] + "</td></tr>";
    }
   }
   catch (e) {}
   proctitle.innerText = mainlng[lngID][8];
   if (!hidetotalflag){
    lengthadd = 1;
    result += "<tr style='height:" + parseInt(10 * size) + "'><td colspan=2>" + GetTotal() + "</td></tr>";
   }
   gadgetbody.innerHTML = "<table style='width:" + parseInt(116 * size) + "px;font-size:" + parseInt(9 * size) + "px'>" + result + "</table>";
   finalsetup(TopProcesses.length + lengthadd);
  }//end if
 else
  if (processmode === "Write"){
   var TopProcessInfo = getTopProcessesByWriteBytes(processes, oldProcesses, numProcesses);
   try{
    var TopProcesses = TopProcessInfo.TopProcesses || [];
    for(var i=0; i<TopProcesses.length; i++){
     var process = TopProcesses[i];	
	 var WriteBytesPerSec = process.WriteBytes1 / (refreshRate / 1000);
     var ProcName = process.Name;
     if (ProcName.length > 15) ProcName = ProcName.substr(0,15) + "...";
     result += "<tr style='color:" + cUsedEasy + ";height:" + parseInt(10 * size) + "'><td style='width:" + parseInt(70 * size) + "px'>" +
     "<span style='cursor:help' title='" + process.Name + "\n" + "ID:" + process.ProcessId + mainlng[lngID][3] + process.Priority + mainlng[lngID][4] + process.ThreadCount + "'>" +
     ProcName + "</span></td><td style='text-align:right'>" + formatBytes(WriteBytesPerSec) + mainlng[lngID][25] + "</td></tr>";
    }
   }
   catch (e) {}
   proctitle.innerText = mainlng[lngID][9];
   if (!hidetotalflag){
    lengthadd = 1;
    result += "<tr style='height:" + parseInt(10 * size) + "'><td colspan=2>" + GetTotal() + "</td></tr>";
   }
   gadgetbody.innerHTML = "<table style='width:" + parseInt(116 * size) + "px;font-size:" + parseInt(9*size) + "px'>" + result + "</table>";
   finalsetup(TopProcesses.length + lengthadd);
  }//end if
 else
  if (processmode === "Page"){
   proctitle.innerText = mainlng[lngID][10];
   var Pageall = parseInt('0', 10);
   var nopagefile;
   var allPage = objWMIService.ExecQuery("SELECT AllocatedBaseSize FROM Win32_PageFileUsage");
   try{
    for(var eItems = new Enumerator(allPage); eItems.atEnd() == false; eItems.moveNext()) 
     Pageall += parseInt(eItems.item().AllocatedBaseSize, 10);
    Pageall *= 1024;
    if (Pageall != 0) nopagefile = false;
    else nopagefile = true;
   }
   catch (e) {nopagefile = true}

   if  (!nopagefile){
    try {processes.sort(SortProcessesByPageFileUsage)}
    catch (e){}
    var TopProcesses = processes.slice(0, numProcesses);
    try{
     for (var i=0; i<TopProcesses.length; i++){
      var process = TopProcesses[i];
      if (!process || process.ProcessId == null) continue;
      var pageusage = process.PageFileUsage;
      var ProcName = process.Name;
      if (ProcName.length > 15) ProcName = ProcName.substr(0,15) + "...";
      var pcolor;
      var pageusageprct = pageusage / Pageall * 100;
      if (pageusageprct < warninguse) pcolor = cUsedEasy; //easy
      else if (pageusageprct > criticaluse) pcolor = cUsedHard; //hard
      else pcolor = cUsedMedium; //moderate
     if (!memorypersent){
      result += "<tr style='color:" + cUsedEasy + ";height:" + parseInt(10 * size) + "'><td style='width:" + parseInt(80 * size) + "px'>" +
      "<span style='cursor:help' title='" + process.Name + "\n" + "ID:" + process.ProcessId + mainlng[lngID][3] + process.Priority + mainlng[lngID][4] + process.ThreadCount + "'>" +
      ProcName + "</span></td><td style='text-align:right'>" + formatBytes(pageusage) + mainlng[lngID][24] + "</td></tr>";
     }
     else{
      result += "<tr style='color:" + pcolor + ";height:" + parseInt(10 * size) + "'><td style='width:" + parseInt(80 * size) + "px'>" +
      "<span style='cursor:help' title='" + process.Name + "\n" + "ID:" + process.ProcessId + mainlng[lngID][3] + process.Priority + mainlng[lngID][4] + process.ThreadCount + "'>" +
      ProcName + "</span></td><td style='text-align:right'>" + pageusageprct.toFixed(1) + "%</td></tr>";
     }
     }//for
    }
    catch (e) {}
    if (!hidetotalflag){
     lengthadd = 1;
     result += "<tr style='height:" + parseInt(10 * size) + "'><td colspan=2>" + GetTotal() + "</td></tr>";
    }
    gadgetbody.innerHTML = "<table style='width:" + parseInt(116 * size) + "px;font-size:" + parseInt(9 * size) + "px'>" + result + "</table>";
   finalsetup(TopProcesses.length + lengthadd);
   }//end if !nopagefile
   else{
    gadgetbody.innerHTML = "<span style='color:" + cErrMsg + "'>&nbsp;&nbsp;&nbsp;PageFile not found</span>";
    finalsetup(1);
   }
  }//end if
 else 
  if (processmode === "Virtual"){
   try {processes.sort(SortProcessesByVirtualSize)}
   catch (e){}
   var TopProcesses = processes.slice(0, numProcesses);
   try{
    for (var i=0; i<TopProcesses.length; i++){
     var process = TopProcesses[i];
     if (!process || process.ProcessId == null) continue;
     var virtusage = process.VirtualSize;
     var ProcName = process.Name;
     if (ProcName.length > 15) ProcName = ProcName.substr(0,15) + "...";
     var pcolor;
     var virtprct = virtusage / VIRall * 100;
     if (virtprct < warninguse) pcolor = cUsedEasy; //easy
     else if (virtprct > criticaluse) pcolor = cUsedHard; //hard
     else pcolor = cUsedMedium; //moderate
     if (!memorypersent){
      result += "<tr style='color:" + cUsedEasy + ";height:" + parseInt(10 * size) + "'><td style='width:" + parseInt(80 * size) + "px'>" +
      "<span style='cursor:help' title='" + process.Name + "\n" + "ID:" + process.ProcessId + mainlng[lngID][3] + process.Priority + mainlng[lngID][4] + process.ThreadCount + "'>" +
      ProcName + "</span></td><td style='text-align:right'>" + formatBytes(virtusage) + mainlng[lngID][24] + "</td></tr>";
     }
     else{
      result += "<tr style='color:" + pcolor + ";height:" + parseInt(10 * size) + "'><td style='width:" + parseInt(80 * size) + "px'>" +
      "<span style='cursor:help' title='" + process.Name + "\n" + "ID:" + process.ProcessId + mainlng[lngID][3] + process.Priority + mainlng[lngID][4] + process.ThreadCount + "'>" +
      ProcName + "</span></td><td style='text-align:right'>" + virtprct.toFixed(1) + "%</td></tr>";
     }
    }//for
   }
   catch (e) {}
   proctitle.innerText = mainlng[lngID][11];
   if (!hidetotalflag){
    lengthadd = 1;
    result += "<tr style='height:" + parseInt(10 * size) + "'><td colspan=2>" + GetTotal() + "</td></tr>";
   }
   gadgetbody.innerHTML = "<table style='width:" + parseInt(116 * size) + "px;font-size:" + parseInt(9 * size) + "px'>" + result + "</table>";
   finalsetup(TopProcesses.length + lengthadd);
  }//end if
 else
  if (processmode === "TRead"){
   getProcessesTotalReadBytes(processes, oldProcesses);
   try{
    var len = twoDimRead.length < numProcesses ? twoDimRead.length : numProcesses;
    for(var i=0; i<len; i++){
     insertionSort(twoDimRead);
     twoDimRead.reverse();
     var ReadTotalBytes = twoDimRead[i][1];
     var ProcName = twoDimRead[i][0];
     if (ProcName.length > 15) ProcName = ProcName.substr(0,15) + "...";
     result += "<tr style='color:" + cUsedEasy + ";height:" + parseInt(10 * size) + "'><td style='width:" + parseInt(80 * size) + "px'>" +
     "<span style='cursor:help' title='" + ProcName + "\n" + "ID:" + twoDimRead[i][2] + mainlng[lngID][3] + twoDimRead[i][3] + mainlng[lngID][4] + twoDimRead[i][4] + "'>" +
     ProcName + "</span></td><td style='text-align:right'>" + formatBytes(ReadTotalBytes) + mainlng[lngID][24] + "</td></tr>";
    }
   }
   catch (e) {}
   proctitle.innerText = mainlng[lngID][12];
   if (!hidetotalflag){
    lengthadd = 1;
    result += "<tr style='height:" + parseInt(10 * size) + "'><td colspan=2>" + GetTotal() + "</td></tr>";
   }
   gadgetbody.innerHTML = "<table style='width:" + parseInt(116 * size) + "px;font-size:" + parseInt(9 * size) + "px'>" + result + "</table>";
   finalsetup(len + lengthadd);
  }//end if
 else
  if (processmode === "TWrite"){
   getProcessesTotalWriteBytes(processes, oldProcesses);
   try{
    var len = twoDimWrite.length < numProcesses ? twoDimWrite.length : numProcesses;
    for(var i=0; i<len; i++){
     insertionSort(twoDimWrite);
     twoDimWrite.reverse();
	 var WriteTotalBytes = twoDimWrite[i][1];
     var ProcName = twoDimWrite[i][0];
     if (ProcName.length > 15) ProcName = ProcName.substr(0,15) + "...";
     result += "<tr style='color:" + cUsedEasy + ";height:" + parseInt(10 * size) + "'><td style='width:" + parseInt(80 * size) + "px'>" +
     "<span style='cursor:help' title='" + ProcName + "\n" + "ID:" + twoDimWrite[i][2] + mainlng[lngID][3] + twoDimWrite[i][3] + mainlng[lngID][4] + twoDimWrite[i][4] + "'>" +
     ProcName + "</span></td><td style='text-align:right'>" + formatBytes(WriteTotalBytes) + mainlng[lngID][24] + "</td></tr>";
    }
   }
   catch (e) {}
   proctitle.innerText = mainlng[lngID][13];
   if (!hidetotalflag){
    lengthadd = 1;
    result += "<tr style='height:" + parseInt(10 * size) + "'><td colspan=2>" + GetTotal() + "</td></tr>";
   }
   gadgetbody.innerHTML = "<table style='width:" + parseInt(116 * size) + "px;font-size:" + parseInt(9 * size) + "px'>" + result + "</table>";
   finalsetup(len + lengthadd);
  }//end if
  oldProcesses = processes;
 }
 catch (e){
  proctitle.innerText = mainlng[lngID][14];
  gadgetbody.innerHTML = "<span style='color:" + cErrMsg + "'>" + mainlng[lngID][15] + "</span>";
  finalsetup(1);
 }
 timervar = setTimeout("update()", refreshRate);
}

function copyText(texttocopy){
 window.clipboardData.setData('Text',texttocopy);
}

function GetTotal(){
 var s;
 try{
  var TProc = objWMIService.ExecQuery("SELECT Processes, Threads FROM Win32_PerfFormattedData_PerfOS_System");
  var TProcesses = (new Enumerator(TProc)).item().Processes;
  var TThreads = (new Enumerator(TProc)).item().Threads;
  s = "<span style='letter-spacing:-0.02em;color:" + cServStr + "'>" + mainlng[lngID][16] + "<span style='color:" + cUsedEasy + "'><strong>" + TThreads +
      "</strong></span>" + mainlng[lngID][17] + "<span style='color:" + cUsedEasy + "'><strong>" + TProcesses + "</strong></span>" + mainlng[lngID][18] + "</span>";
 }
 catch (e){
  s = "";
  hidetotalflag = true;
  System.Gadget.Settings.write ("TotalHide", "true");
 }
 return s;
}

function ProcessInfo(ProcessId,Name,KernelModeTime,UserModeTime,WorkingSetSize,ReadBytes,WriteBytes,PageFileUsage,VirtualSize,Priority,ThreadCount){
 this.ProcessId = ProcessId;
 this.Name = Name;
 this.KernelModeTime = parseInt(KernelModeTime);
 this.UserModeTime = parseInt(UserModeTime);
 this.TotalTime = this.KernelModeTime + this.UserModeTime;
 this.WorkingSetSize = parseInt(WorkingSetSize);
 this.ReadBytes = parseInt(ReadBytes);
 this.ReadBytes1 = parseInt(ReadBytes);
 this.WriteBytes = parseInt(WriteBytes);
 this.WriteBytes1 = parseInt(WriteBytes);
 this.TotalBytes = this.ReadBytes + this.WriteBytes;
 this.PageFileUsage = parseInt(PageFileUsage);
 this.VirtualSize = parseInt(VirtualSize);
 this.Priority = Priority;
 this.ThreadCount = ThreadCount;
}

function getProcesses(){
 var processes = new Array();
 var ProcessItems = objWMIService.ExecQuery("SELECT ProcessId,Name,KernelModeTime,UserModeTime,WorkingSetSize,ReadTransferCount,WriteTransferCount,PageFileUsage,VirtualSize,Priority,ThreadCount FROM Win32_Process");
 var ProcessItem  = new Enumerator(ProcessItems);
 for (; !ProcessItem.atEnd(); ProcessItem.moveNext()){
  var item = ProcessItem.item();
  var ProcessId = item.ProcessId;
  if (!ProcessId && ProcessId !== 0) ProcessId = -1;
  var Name = item.Name;
  var KernelModeTime = item.KernelModeTime;
  var UserModeTime = item.UserModeTime;
  var WorkingSetSize = item.WorkingSetSize;
  var ReadBytes = item.ReadTransferCount;
  var WriteBytes = item.WriteTransferCount;
  var PageFileUsage = item.PageFileUsage;
  var VirtualSize = item.VirtualSize;
  var Priority = item.Priority;
  var ThreadCount = item.ThreadCount;
  processes.push(new ProcessInfo(ProcessId,Name,KernelModeTime,UserModeTime,WorkingSetSize,ReadBytes,WriteBytes,PageFileUsage,VirtualSize,Priority,ThreadCount));
 }
 return processes;
}

function SortProcessByID(a,b) {return a.ProcessId-b.ProcessId}
function SortProcessesByTotalTime(a,b) {return b.TotalTime-a.TotalTime}
function SortProcessesByMemory(a,b) {return b.WorkingSetSize-a.WorkingSetSize}
function SortProcessesByIOBytes(a,b) {return b.TotalBytes-a.TotalBytes}
function SortProcessesByReadBytes(a,b) {return b.ReadBytes1-a.ReadBytes1}
function SortProcessesByWriteBytes(a,b) {return b.WriteBytes1-a.WriteBytes1}
function SortProcessesByPageFileUsage(a,b) {return b.PageFileUsage-a.PageFileUsage}
function SortProcessesByVirtualSize(a,b) {return b.VirtualSize-a.VirtualSize}

function getTopProcessesByCPU(processes, oldProcesses, numTop){
 try{
  var SystemTotalTime = new Number(0);
  var TopProcesses = new Array();
  var oldProcessIndex = 0;
  for(var i=0; i<processes.length; i++){
   var process = processes[i];
   if (!process || process.ProcessId == null || process.TotalTime == null) continue;
   var oldInfo = FindCorrespondingProcess(process, oldProcesses, oldProcessIndex);
   oldProcessIndex = oldInfo.newIndex;
   var oldProcess = oldInfo.oldProcess;
   if(oldProcess && oldProcess.KernelModeTime != null && oldProcess.UserModeTime != null) process.TotalTime -= (oldProcess.KernelModeTime + oldProcess.UserModeTime);
   SystemTotalTime += process.TotalTime;
   // ignore system processes
   if (process.ProcessId) TopProcesses.push(process);
  }//for
  try {TopProcesses.sort(SortProcessesByTotalTime)}
  catch (e){}
 return {TopProcesses: TopProcesses.slice(0,numTop), TotalTime: SystemTotalTime};
 }
 catch (e){}
}

function getTopProcessesByIOBytes(processes, oldProcesses, numTop){
 try{
  var TopProcesses = new Array();
  var oldProcessIndex = 0;
  for(var i=0; i<processes.length; i++){
   var process = processes[i];
   var oldInfo = FindCorrespondingProcess(process, oldProcesses, oldProcessIndex);
   oldProcessIndex = oldInfo.newIndex;
   var oldProcess = oldInfo.oldProcess;
   if(oldProcess != null) process.TotalBytes -= (oldProcess.ReadBytes + oldProcess.WriteBytes);
   else process.TotalBytes = 0;
   // ignore system processes
   if (process.ProcessId) TopProcesses.push(process);
  }//for
  try {TopProcesses.sort(SortProcessesByIOBytes)}
  catch (e){}
 return {TopProcesses: TopProcesses.slice(0,numTop)};
 }
 catch (e){}
}

function getTopProcessesByReadBytes(processes, oldProcesses, numTop){
 try{
  var TopProcesses = new Array();
  var oldProcessIndex = 0;
  for(var i=0; i<processes.length; i++){
   var process = processes[i];
   var oldInfo = FindCorrespondingProcess(process, oldProcesses, oldProcessIndex);
   oldProcessIndex = oldInfo.newIndex;
   var oldProcess = oldInfo.oldProcess;
   if(oldProcess != null) process.ReadBytes1 -= oldProcess.ReadBytes;
   else process.ReadBytes1 = 0;
   // ignore system processes
   if (process.ProcessId) TopProcesses.push(process);
  }//for
  try {TopProcesses.sort(SortProcessesByReadBytes)}
  catch (e){}
 return {TopProcesses: TopProcesses.slice(0,numTop)};
 }
 catch (e){}
}

function getTopProcessesByWriteBytes(processes, oldProcesses, numTop){
 try{
  var TopProcesses = new Array();
  var oldProcessIndex = 0;
  for(var i=0; i<processes.length; i++){
   var process = processes[i];
   var oldInfo = FindCorrespondingProcess(process, oldProcesses, oldProcessIndex);
   oldProcessIndex = oldInfo.newIndex;
   var oldProcess = oldInfo.oldProcess;
   if(oldProcess != null) process.WriteBytes1 -= oldProcess.WriteBytes;
   else process.WriteBytes1 = 0;
   // ignore system processes
   if (process.ProcessId) TopProcesses.push(process);
  }//for
  try {TopProcesses.sort(SortProcessesByWriteBytes)}
  catch (e){}
 return {TopProcesses: TopProcesses.slice(0,numTop)};
 }
 catch (e){}
}

function getProcessesTotalReadBytes(processes, oldProcesses){
 twoDimRead.length = 0;
 try{
  for(var i=0; i<processes.length; i++){
   var process = processes[i];
   twoDimRead[i] = new Array()
   twoDimRead[i][0] = process.Name;
   twoDimRead[i][1] = process.ReadBytes1;
   twoDimRead[i][2] = process.ProcessId;
   twoDimRead[i][3] = process.Priority;
   twoDimRead[i][4] = process.ThreadCount;
  }//for
 }
 catch (e){}
}

function getProcessesTotalWriteBytes(processes, oldProcesses){
 twoDimWrite.length = 0;
 try{
  for(var i=0; i<processes.length; i++){
   var process = processes[i];
   twoDimWrite[i] = new Array()
   twoDimWrite[i][0] = process.Name;
   twoDimWrite[i][1] = process.WriteBytes1;
   twoDimWrite[i][2] = process.ProcessId;
   twoDimWrite[i][3] = process.Priority;
   twoDimWrite[i][4] = process.ThreadCount;
  }//for
 }
 catch (e){}
}

function FindCorrespondingProcess(process, oldProcesses, startIndex){
 try{
  var index = startIndex;
  while (index < oldProcesses.length && oldProcesses[index] && process.ProcessId != oldProcesses[index].ProcessId) {index++}
  if(index > oldProcesses.length){
   //we didn't find a new process
   return {oldProcess: null, newIndex: startIndex};
  }
  else{
   return {oldProcess: oldProcesses[index], newIndex: index+1};
  }
 }
 catch (e) {}
}

function fixedDigits(value){
 if (value >= 10) return value.toFixed(0);
 else return value.toFixed(1);
}

function formatBytes(bytes){
 if (bytes > 1125899906842624) return fixedDigits(((((bytes / 1024) / 1024) / 1024) / 1024) / 1024) + mainlng[lngID][19];
 if (bytes > 1099511627776) return fixedDigits(bytes / 1024 / 1024 / 1024 / 1024) + mainlng[lngID][20];
 if (bytes > 1073741824) return fixedDigits(bytes / 1024 / 1024 / 1024) + mainlng[lngID][21];
 if (bytes > 1048576) return fixedDigits(bytes / 1024 / 1024) + mainlng[lngID][22];
 if (bytes > 1024) return fixedDigits(bytes / 1024) + mainlng[lngID][23];
 return fixedDigits(bytes) + " ";
}

function insert(arr,i){
 var j;
 var v = arr[i][1];
 var tmp = arr[i];
 for (j=i-1; j>=0; j--){
  if (arr[j][1] <= v) break;
  arr[j+1] = arr[j];
 }
 arr[j+1] = tmp;
}

function insertionSort(arr){
 var i = 1;
 while (i<arr.length){
  insert(arr, i);
  i++;
 }
}

function cycle(){
 if (!cycleflag) return;
 clearTimeout(timervar);
 for (var i=1; i<=numcyclepos; i++){
  if (caction[cyclepos] != null){
   processmode = caction[cyclepos];
   cyclepos++;
   if (cyclepos>numcyclepos) cyclepos = 1;
   break;
  }
  cyclepos++;
  if (cyclepos>numcyclepos) cyclepos = 1;
 }

 oldProcesses = getProcesses();
 try {oldProcesses.sort(SortProcessByID)}
 catch (e){}
 timervar = setTimeout("update()", 500);
}

function runTaskManager(){
 switch (parseInt(dblclcaction)){
  case 0:
   System.Shell.execute("taskmgr.exe");
   break;

  case 1:
   System.Shell.execute("resmon", "/res");
   break;

  case 2:
   System.Shell.execute("perfmon.exe");
   break;

  default:
   return;
 }
}