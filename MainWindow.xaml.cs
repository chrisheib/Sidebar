using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Navigation;
using System.Windows.Shapes;
using WpfAppBar;

namespace Sidebar
{
    /// <summary>
    /// Interaktionslogik für MainWindow.xaml
    /// </summary>
    public partial class MainWindow : Window
    {
        public MainWindow()
        {
            InitializeComponent();
            //Uhr
            //CPU
            InitCPU();
            //GPU
            //Drives
            InitDrives();
            //Prozesse Memory
            //Prozesse CPU
            //Netzwerk
            InitNetwork();
            //Ping
        }

        private void InitCPU()
        {
            new BackgroundWorkerProgressBar().Init(pbCPUTotal, "Processor", "% Processor Time", "_Total", 1000, lblCPUTotal);
            new BackgroundWorkerProgressBar().Init(pbCPUCore1, "Processor", "% Processor Time", "0", 1000, lblCPUCore1);
            new BackgroundWorkerProgressBar().Init(pbCPUCore2, "Processor", "% Processor Time", "1", 1000, lblCPUCore2);
            new BackgroundWorkerProgressBar().Init(pbCPUCore3, "Processor", "% Processor Time", "2", 1000, lblCPUCore3);
            new BackgroundWorkerProgressBar().Init(pbCPUCore4, "Processor", "% Processor Time", "3", 1000, lblCPUCore4);
            new BackgroundWorkerProgressBar().Init(pbCPUCore5, "Processor", "% Processor Time", "4", 1000, lblCPUCore5);
            new BackgroundWorkerProgressBar().Init(pbCPUCore6, "Processor", "% Processor Time", "5", 1000, lblCPUCore6);
            new BackgroundWorkerProgressBar().Init(pbCPUCore7, "Processor", "% Processor Time", "6", 1000, lblCPUCore7);
            new BackgroundWorkerProgressBar().Init(pbCPUCore8, "Processor", "% Processor Time", "7", 1000, lblCPUCore8);
        }

        private void InitDrives()
        {
            DriveInfo[] allDrives = DriveInfo.GetDrives();
            foreach (DriveInfo d in allDrives)
            {
                DriveLeft.Children.Add(new Label()
                {
                    Content = d.Name,
                    Padding = new Thickness(0, 0, 0, 0),
                    Height = 20,
                    Foreground = Brushes.LightGray
                });
                var lbl = new Label()
                {
                    Content = d.Name,
                    Padding = new Thickness(0, 0, 0, 0),
                    FontSize = 10,
                    Height = 15,
                    Foreground = Brushes.LightGray
                };
                DriveLeft.Children.Add(lbl);
                var bar = new ProgressBar()
                {
                    Height = 10,
                    Margin = new Thickness(0, 22, 0, 3),
                    Background = Brushes.Gray
                };
                DriveRight.Children.Add(bar);
                new BackgroundWorkerProgressBar().Init(null, "Logischer Datenträger", "Zeit (%)", d.Name[0].ToString() + d.Name[1].ToString(), 1000, lbl);
                new BackgroundWorkerProgressBar().Init(bar, "Logischer Datenträger", "Freier Speicherplatz (%)", d.Name[0].ToString() + d.Name[1].ToString(), 1000, null);
            }
        }

        private void InitNetwork()
        {
            new BackgroundWorkerProgressBar().Init(null, "Netzwerkschnittstelle", "Empfangene Bytes/s" , "Intel[R] Ethernet Connection [2] I219-V", 1000, null, (int value) =>
            {
                NetworkDown.Value = ((value / 1024f) / ((110f * 1024f) / 8)) * 100f;
            });
            new BackgroundWorkerProgressBar().Init(null, "Netzwerkschnittstelle", "Bytes gesendet/s", "Intel[R] Ethernet Connection [2] I219-V", 1000, null,(int value) => 
            {
                NetworkUp.Value = ((value / 1024f) / ((55f*1024f)/8f)) * 100f;
            });
        }

        private void Button_Click_2(object sender, RoutedEventArgs e)
        {
            Close();
        }

        private void Window_Loaded(object sender, RoutedEventArgs e)
        {
            AppBarFunctions.SetAppBar(this, ABEdge.Right);
        }

        private void Window_Closing(object sender, EventArgs e)
        {
            AppBarFunctions.SetAppBar(this, ABEdge.None);
        }
    }
}
