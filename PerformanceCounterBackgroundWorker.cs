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
    class PerformanceCounterBackgroundWorker
    {

        private BackgroundWorker backgroundWorker;
        private ProgressBar bar;
        private Label label;
        private PerformanceCounter perfCounter;
        private int repeat;
        private int value;
        private event DummyEvent OnUpdate;

        public delegate void DummyEvent(int value);

        public void Init(ProgressBar bar, string category, string value, string param, int repeat, Label label, DummyEvent onUpdate = null)
        {

            this.repeat = repeat;
            this.label = label;
            this.bar = bar;
            OnUpdate = onUpdate;
            this.value = 0;

            perfCounter = new PerformanceCounter(category, value, param);

            backgroundWorker = new BackgroundWorker
            {
                WorkerReportsProgress = true,
                WorkerSupportsCancellation = true
            };

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
                value = (int)Math.Truncate(perfCounter.NextValue());
                backgroundWorker.ReportProgress(0);
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
            if (bar != null)
            {
                bar.Value = value;
            }
            if (label != null)
            {
                label.Content = value.ToString() + "%";
            }
            if (OnUpdate != null)
            {
                OnUpdate.Invoke(value);
            }
        }

    }

}