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
    class BackgroundWorkerProgressBar
    {

        private BackgroundWorker backgroundWorker;
        private ProgressBar bar;
        private Label label;
        private PerformanceCounter perfCounter;
        private int repeat;

        public void Init(ProgressBar bar, string category, string value, string param, int repeat = 1000, Label label = null)
        {

            this.repeat = repeat;
            this.label = label;
            this.bar = bar;

            perfCounter = new PerformanceCounter(category, value, param);

            backgroundWorker = new BackgroundWorker
            {
                WorkerReportsProgress = true,
                WorkerSupportsCancellation = true
            };

            //Event creation.    
            //For the performing operation in the background.    
            backgroundWorker.DoWork += BackgroundWorker_DoWork; 
            backgroundWorker.ProgressChanged += BackgroundWorker_ProgressChanged;
            backgroundWorker.RunWorkerAsync();
        }

        /// <summary>    
        /// Performs operation in the background.    
        /// </summary>    
        /// <param name="sender"></param>    
        /// <param name="e"></param>    
        void BackgroundWorker_DoWork(object sender, DoWorkEventArgs e)
        {
            while (true)
            {
                if (backgroundWorker.CancellationPending)
                {
                    e.Cancel = true;
                    return;
                }
                backgroundWorker.ReportProgress((int)Math.Truncate((double) perfCounter.NextValue()));
                Thread.Sleep(repeat);
            }
        }

        /// <summary>    
        /// Displays Progress changes to UI .    
        /// </summary>    
        /// <param name="sender"></param>    
        /// <param name="e"></param>    
        void BackgroundWorker_ProgressChanged(object sender, ProgressChangedEventArgs e)
        {
            bar.Value = e.ProgressPercentage;
            if (label != null)
            {
                label.Content = e.ProgressPercentage.ToString() + "%";
            }
        }

    }

}