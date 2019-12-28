using System;
using System.IO;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;
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
                    Padding = new Thickness(0, 2, 0, 0),
                    FontSize = 10,
                    Height = 15,
                    Foreground = Brushes.LightGray
                });
                var lbl = new Label()
                {
                    Padding = new Thickness(0, 2, 4, 0),
                    HorizontalAlignment = HorizontalAlignment.Right,
                    FontSize = 10,
                    Height = 15,
                    Foreground = Brushes.LightGray
                };
                DriveMiddle.Children.Add(lbl);
                var bar = new ProgressBar()
                {
                    Height = 10,
                    Margin = new Thickness(0, 4, 0, 1),
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
                NetworkDown.Value = Math.Truncate(value / 1024f / (115f * 1024f / 8f) * 100f);
                NetworkDownNumber.Content = GetBytesReadable(value);
            });
            new BackgroundWorkerProgressBar().Init(null, "Netzwerkschnittstelle", "Bytes gesendet/s", "Intel[R] Ethernet Connection [2] I219-V", 1000, null,(int value) => 
            {
                NetworkUp.Value = Math.Truncate(value / 1024f / (60f * 1024f / 8f) * 100f);
                NetworkUpNumber.Content = GetBytesReadable(value);
            });
        }

        private void Button_Click_2(object sender, RoutedEventArgs e)
        {
            Close();
        }

        private void Window_Loaded(object sender, RoutedEventArgs e)
        {
            // Auf 2tem Bildschirm öffnen
            if (System.Windows.Forms.Screen.AllScreens.Length > 1)
            {
                System.Windows.Forms.Screen s2 = System.Windows.Forms.Screen.AllScreens[1];
                System.Drawing.Rectangle r2 = s2.WorkingArea;
                Top = r2.Top;
                Left = r2.Left;
            }
            else
            {
                System.Windows.Forms.Screen s1 = System.Windows.Forms.Screen.AllScreens[0];
                System.Drawing.Rectangle r1 = s1.WorkingArea;
                Top = r1.Top;
                Left = r1.Left;
            }

            AppBarFunctions.SetAppBar(this, ABEdge.Left);
        }

        private void Window_Closing(object sender, EventArgs e)
        {
            AppBarFunctions.SetAppBar(this, ABEdge.None);
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
            if (absolute_i >= 0x1000000000000000) // Exabyte
            {
                suffix = "EB/s";
                readable = (i >> 50);
            }
            else if (absolute_i >= 0x4000000000000) // Petabyte
            {
                suffix = "PB/s";
                readable = (i >> 40);
            }
            else if (absolute_i >= 0x10000000000) // Terabyte
            {
                suffix = "TB/s";
                readable = (i >> 30);
            }
            else if (absolute_i >= 0x40000000) // Gigabyte
            {
                suffix = "GB/s";
                readable = (i >> 20);
            }
            else if (absolute_i >= 0x100000) // Megabyte
            {
                suffix = "MB/s";
                readable = (i >> 10);
            }
            else if (absolute_i >= 0x400) // Kilobyte
            {
                suffix = "KB/s";
                readable = i;
            }
            else
            {
                return i.ToString("0 B/s"); // Byte
            }
            // Divide by 1024 to get fractional value
            readable = (readable / 1024);
            // Return formatted number with suffix
            return readable.ToString("0.### ") + suffix;
        }
    }
}
