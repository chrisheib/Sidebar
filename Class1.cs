using System;    
using System.ComponentModel;
using System.Diagnostics;
using System.Threading;
using System.Windows.Controls;

namespace Sidebar
{

    /// <summary>    
    /// It implements backgroundworker.   
    /// </summary>    
    class CPU
    {

        private static BackgroundWorker backgroundWorker;
        private static ProgressBar bar;
        private static PerformanceCounter perfCounter;

        public static void Init(ProgressBar oBar)
        {

            bar = oBar;
            perfCounter = new PerformanceCounter("Processor", "% Processor Time", "_Total");

            backgroundWorker = new BackgroundWorker
            {

                WorkerReportsProgress = true,
                WorkerSupportsCancellation = true

            };

            //Event creation.    
            //For the performing operation in the background.    
            backgroundWorker.DoWork += BackgroundWorker_DoWork; 
            backgroundWorker.ProgressChanged += BackgroundWorker_ProgressChanged;
            backgroundWorker.RunWorkerCompleted += BackgroundWorker_RunWorkerCompleted;
            backgroundWorker.RunWorkerAsync();

        }

        /// <summary>    
        /// Performs operation in the background.    
        /// </summary>    
        /// <param name="sender"></param>    
        /// <param name="e"></param>    

        static void BackgroundWorker_DoWork(object sender, DoWorkEventArgs e)
        {

            while (true)
            {

                if (backgroundWorker.CancellationPending)
                {

                    e.Cancel = true;
                    return;

                }

                backgroundWorker.ReportProgress((int)Math.Truncate((double) perfCounter.NextValue()));
                Thread.Sleep(1000);
                e.Result = 1000;

            }

        }

        /// <summary>    
        /// Displays Progress changes to UI .    
        /// </summary>    
        /// <param name="sender"></param>    
        /// <param name="e"></param>    

        static void BackgroundWorker_ProgressChanged(object sender, ProgressChangedEventArgs e)
        {

            bar.Value = e.ProgressPercentage;

        }

        /// <summary>    
        /// Displays result of background performing operation.    
        /// </summary>    
        /// <param name="sender"></param>    
        /// <param name="e"></param>    

        static void BackgroundWorker_RunWorkerCompleted(object sender, RunWorkerCompletedEventArgs e)
        {

            if (e.Cancelled)
            {

                Console.WriteLine("Operation Cancelled");

            }

            else if (e.Error != null)
            {

                Console.WriteLine("Error in Process :" + e.Error);

            }

            else
            {

                Console.WriteLine("Operation Completed :" + e.Result);

            }

        }

    }

}