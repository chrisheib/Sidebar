using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Navigation;
using System.Windows.Shapes;
using System.Threading;

//------------------------------------------------------------------------------//
//                                                                              //
// Author:  Derek Bartram                                                       //
// Date:    23/01/2008                                                          //
// Version: 1.000                                                               //
// Website: http://www.derek-bartram.co.uk                                      //
// Email:   webmaster@derek-bartram.co.uk                                       //
//                                                                              //
// This code is provided on a free to use and/or modify basis for personal work //
// provided that this banner remains in each of the source code files that is   //
// found in the original source. For any publicically available work (source    //
// and/or binaries 'Derek Bartram' and 'http://www.derek-bartram.co.uk' must be //
// credited in both the user documentation, source code (where applicable), and //
// in the user interface (typically Help > About would be appropiate). Please   //
// also contact myself via the provided email address to let me know where and  //
// what my code is being used for; this helps me provide better solutions for   //
// all.                                                                         //
//                                                                              //
// THIS SOURCE AND/OR COMPILED LIBRARY MUST NOT BE USED FOR COMMERCIAL WORK,    //
// including not-for-profit work, without prior consent.                        //
//                                                                              //
// This agreement overrides any other agreements made by any other parties. By  //
// using, viewing, linking, or compiling the included source or binaries you    //
// agree to the terms and conditions as set out here and in any included (if    //
// applicable) license.txt. For commercial licensing please see the web address //
// above or contact myself via email. Thank you.                                //
//                                                                              //
// Please contact me at the above email for further help, information,          //
// comments, suggestions, licensing, or feature requests. Thank you.            //
//                                                                              //
//                                                                              //
//------------------------------------------------------------------------------//

namespace DNBSoft.WPF.RollingMonitor
{
    public class RollingSeries
    {
        private List<double> values = new List<double>();
        private List<Line> lines = new List<Line>();

        public delegate double NextValueDelegate();
        private delegate void RefreshDelegate();

        private RollingMonitor monitor = null;
        private NextValueDelegate next = null;

        private bool running = true;

        private Brush lineBrush = new SolidColorBrush(Color.FromRgb(0, 0, 0));
        private double lineThickness = 1.0;

        public RollingSeries(RollingMonitor monitor, NextValueDelegate next)
        {
            this.monitor = monitor;
            this.next = next;

            #region create initial data / lines
            for (int i = 0; i < monitor.MaintainHistoryCount; i++)
            {
                values.Add(0);
                Line l = new Line() 
                { 
                    X1 = i * 1, 
                    X2 = i * 1 + 1, 
                    Y1 = 0, 
                    Y2 = 0,
                    Stroke = this.LineBrush, 
                    StrokeThickness = this.lineThickness 
                };
                lines.Add(l);
                monitor.Children.Add(l);
            }
            #endregion

            #region update thread
            Thread t = new Thread(delegate()
            {
                while (true)
                {
                    #region running
                    if (running)
                    {
                        Thread.Sleep(monitor.UpdateInterval);

                        #region update data
                        values.Add(next());
                        values.RemoveAt(0);
                        #endregion

                        #region update interface
                        monitor.Dispatcher.Invoke(System.Windows.Threading.DispatcherPriority.Normal, new RefreshDelegate(delegate()
                        {
                            for (int i = 0; i < lines.Count - 1 && i < values.Count - 1; i++)
                            {
                                double y1 = Math.Max(Math.Min(values[i], monitor.MaxValue), monitor.MinValue);
                                double y2 = Math.Max(Math.Min(values[i + 1], monitor.MaxValue), monitor.MinValue);
                                lines[i].Y1 = monitor.scaleY(y1);
                                lines[i].Y2 = monitor.scaleY(y2);
                            }
                        }));
                        #endregion
                    }
                    #endregion
                    #region not running state
                    else
                    {
                        try
                        {
                            Thread.Sleep(new TimeSpan(0, 0, 20));
                        }
                        catch (Exception)
                        {
                        }
                    }
                    #endregion
                }
            });
            t.Name = "RollingSeries Update";
            t.Start();
            #endregion

            monitor.SizeChanged += new SizeChangedEventHandler(Canvas_SizeChanged);
            Canvas_SizeChanged(this, null);
        }

        private void Canvas_SizeChanged(object sender, SizeChangedEventArgs e)
        {
            double newMaxX = monitor.ActualWidth;
            double spacing = newMaxX / (lines.Count - 1);

            if (spacing >= monitor.MinValueSpacing)
            {
                for (int i = 0; i < lines.Count; i++)
                {
                    lines[i].X1 = i * spacing;
                    lines[i].X2 = i * spacing + spacing;
                }
            }
            else
            {
                double oldMaxX = (lines.Count - 2) * monitor.MinValueSpacing + monitor.MinValueSpacing;
                double modify = newMaxX - oldMaxX;

                for (int i = 0; i < lines.Count; i++)
                {
                    lines[i].X1 = (i * monitor.MinValueSpacing) + modify;
                    lines[i].X2 = (i * monitor.MinValueSpacing + monitor.MinValueSpacing) + modify;
                }
            }
        }

        #region accessors
        public bool IsRunning
        {
            get
            {
                return running;
            }
            set
            {
                running = value;
            }
        }

        public Brush LineBrush
        {
            get
            {
                return lineBrush;
            }
            set
            {
                lineBrush = value;
                foreach (Line l in lines)
                {
                    l.Stroke = lineBrush;
                }
            }
        }

        public double LineThickness
        {
            get
            {
                return lineThickness;
            }
            set
            {
                lineThickness = value;
                foreach (Line l in lines)
                {
                    l.StrokeThickness = lineThickness;
                }
            }
        }
        #endregion
    }
}
