using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Diagnostics;
using System.Linq;
using System.Management;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;

namespace Sidebar
{
    class Processes
    {
        private readonly BackgroundWorker backgroundWorker;
        private readonly Label[,] lblNames;
        private readonly Label[,] lblValues;
        private IOrderedEnumerable<ProcInfo> orderedListRAM;
        private IOrderedEnumerable<ProcInfo> orderedListCPU;
        private List<ProcInfo> procs;
        private List<ProcInfo> oldProcs;


        public Processes(StackPanel spMemnames, StackPanel spMemvalues, StackPanel spCPUNames, StackPanel spCPUValues)
        {

            lblNames = new Label[2,5];
            lblValues = new Label[2,5];
            for (int j = 0; j < 2; j++)
            {
                for (int i = 0; i < 5; i++)
                {
                    lblNames[j,i] = new Label()
                    {
                        Foreground = Brushes.LightGray,
                        Padding = new Thickness(0, 0, 0, 0),
                        FontSize = 10
                    };
                    lblValues[j,i] = new Label()
                    {
                        Foreground = Brushes.LightGray,
                        HorizontalAlignment = HorizontalAlignment.Right,
                        Padding = new Thickness(0, 0, 0, 0),
                        FontSize = 10
                    };
                    if (j == 0)
                    {
                        spMemnames.Children.Add(lblNames[j, i]);
                        spMemvalues.Children.Add(lblValues[j, i]);
                    }
                    else
                    {
                        spCPUNames.Children.Add(lblNames[j, i]);
                        spCPUValues.Children.Add(lblValues[j, i]);
                    }
                }

            }

            backgroundWorker = new BackgroundWorker
            {
                WorkerReportsProgress = true,
                WorkerSupportsCancellation = true
            };

            backgroundWorker.DoWork += BackgroundWorker_DoWork;
            backgroundWorker.ProgressChanged += BackgroundWorker_ProgressChanged;
            backgroundWorker.RunWorkerAsync();
        }

        void BackgroundWorker_DoWork(object sender, DoWorkEventArgs e)
        {
            while (true)
            {
                procs = new List<ProcInfo>();

                var msecs = GetCurrentMsecs();
                string wmiQuery = string.Format("SELECT ProcessId, Name, WorkingSetSize, KernelModeTime, UserModeTime FROM Win32_Process");
                ManagementObjectCollection retObjectCollection = new ManagementObjectSearcher(wmiQuery).Get();

                foreach (var p in retObjectCollection)
                { 
                    int id = Convert.ToInt32(p.GetPropertyValue("ProcessId"));
                    if (id == 0)
                    {
                        //Leerlauf überspringen
                        continue;
                    }
                    long time = Convert.ToInt64((ulong)p.GetPropertyValue("KernelModeTime") + (ulong)p.GetPropertyValue("UserModeTime"));
                    var oldproc = FindProcByID(oldProcs, id);
                    float percent = 0f;
                    if (oldproc != null)
                    {
                        percent = ((float)time - (float)oldproc.time) / Environment.ProcessorCount / (msecs - oldproc.msec) / 10000;
                    }
                    
                    procs.Add(new ProcInfo(
                        id,
                        (string)p.GetPropertyValue("Name"),
                        Convert.ToInt64((ulong)p.GetPropertyValue("WorkingSetSize")),
                        msecs,
                        time,
                        percent
                    ));
                }

                orderedListRAM = from entry in procs orderby entry.memory descending select entry;
                orderedListCPU = from entry in procs orderby entry.cpuPercentage descending select entry;

                backgroundWorker.ReportProgress(0);
                Thread.Sleep(1000);
            }
        }

        void BackgroundWorker_ProgressChanged(object sender, ProgressChangedEventArgs e)
        {
            for (int i = 0; i < orderedListRAM.ToList().Count && i < 5; i++)
            {
                lblNames[0, i].Content = orderedListRAM.ToList()[i].name;
                lblValues[0, i].Content = GetBytesReadable(orderedListRAM.ToList()[i].memory);
                lblNames[1, i].Content = orderedListCPU.ToList()[i].name;
                lblValues[1, i].Content = orderedListCPU.ToList()[i].cpuPercentage.ToString("0.0%");
            }
            oldProcs = procs;
        }

        // Returns the human-readable file size for an arbitrary, 64-bit file size 
        // The default format is "0.### XB", e.g. "4.2 KB" or "1.434 GB"
        public string GetBytesReadable(long i)
        {
            // Get absolute value
            long absolute_i = (i < 0 ? -i : i);
            // Determine the suffix and readable value
            string suffix;
            double readable;
            if (absolute_i >= 0x100000) // Megabyte
            {
                suffix = "MB";
                readable = (i >> 10);
            }
            else if (absolute_i >= 0x400) // Kilobyte
            {
                suffix = "KB";
                readable = i;
            }
            else
            {
                return i.ToString("0 B"); // Byte
            }
            // Divide by 1024 to get fractional value
            readable = (readable / 1024);
            // Return formatted number with suffix
            return readable.ToString("0 ") + suffix;
        }

        public long GetCurrentMsecs()
        {
            return DateTime.Now.Ticks / TimeSpan.TicksPerMillisecond;
        }

        public ProcInfo FindProcByID(List<ProcInfo> list, int id)
        {
            if (list == null)
            {
                return null;
            }
            foreach (var p in list)
            {
                if (p.id == id)
                {
                    return p;
                }
            }
            return null;
        }
    }
    class ProcInfo
    {
        public int id;
        public string name;
        public long memory;
        public long msec;
        public float cpuPercentage;
        public long time;
        public ProcInfo(int id, string name, long memory, long msec, long time, float cpuPercentage)
        {
            this.id = id;
            this.name = name;
            this.memory = memory;
            this.msec = msec;
            this.time = time;
            this.cpuPercentage = cpuPercentage;
        }
    }
}
