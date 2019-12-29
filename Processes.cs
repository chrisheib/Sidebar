using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Diagnostics;
using System.Linq;
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
        private BackgroundWorker backgroundWorker;
        private Label[] lblNames;
        private Label[] lblValues;
        private bool ram;
        StackPanel spnames;
        StackPanel spvalues;
        private IOrderedEnumerable<KeyValuePair<long, string>> orderedList;

        public Processes(StackPanel spnames, StackPanel spvalues, bool ram)
        {
            this.spnames = spnames;
            this.spvalues = spvalues;
            this.ram = ram;

            lblNames = new Label[5];
            lblValues = new Label[5];

            for (int i = 0; i < 5; i++)
            {
                lblNames[i] = new Label()
                {
                    Foreground = Brushes.LightGray,
                    Padding = new Thickness(0, 0, 0, 0),
                    FontSize = 10
                };
                lblValues[i] = new Label()
                {
                    Foreground = Brushes.LightGray,
                    HorizontalAlignment = HorizontalAlignment.Right,
                    Padding = new Thickness(0, 0, 0, 0),
                    FontSize = 10
                };

                spnames.Children.Add(lblNames[i]);
                spvalues.Children.Add(lblValues[i]);
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
                var list = new List<KeyValuePair<long, string>>();
                var proc = Process.GetProcesses();
                foreach (var p in proc)
                {
                    if (ram)
                    {
                        list.Add(new KeyValuePair<long, string>(p.PrivateMemorySize64, p.ProcessName));
                    }
                    else
                    {
                        
                    }
                }
                orderedList = from entry in list orderby entry.Key descending select entry;
                backgroundWorker.ReportProgress(0);
                Thread.Sleep(1000);
            }
        }

        void BackgroundWorker_ProgressChanged(object sender, ProgressChangedEventArgs e)
        {
            for (int i = 0; i < orderedList.ToList().Count && i < 5; i++)
            {
                lblNames[i].Content = orderedList.ToList()[i].Value;
                lblValues[i].Content = GetBytesReadable(orderedList.ToList()[i].Key);
            }
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
                suffix = "EB";
                readable = (i >> 50);
            }
            else if (absolute_i >= 0x4000000000000) // Petabyte
            {
                suffix = "PB";
                readable = (i >> 40);
            }
            else if (absolute_i >= 0x10000000000) // Terabyte
            {
                suffix = "TB";
                readable = (i >> 30);
            }
            else if (absolute_i >= 0x40000000) // Gigabyte
            {
                suffix = "GB";
                readable = (i >> 20);
            }
            else if (absolute_i >= 0x100000) // Megabyte
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
    }
}
