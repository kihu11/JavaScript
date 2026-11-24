using System;
using System.Diagnostics;
using System.Management;
using System.Threading;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;
using System.Windows.Shapes;

namespace MultiThreadLab
{
    public partial class MainWindow : Window
    {
        private class PointData
        {
            public double X { get; set; }
            public double Y { get; set; }
        }

        public MainWindow()
        {
            InitializeComponent();
            GetCpuInfo();
        }

        private void GetCpuInfo()
        {
            int cores = Environment.ProcessorCount;
            string clockSpeed = "Н/Д";

            try
            {
                using (var searcher = new ManagementObjectSearcher("select MaxClockSpeed from Win32_Processor"))
                {
                    foreach (var item in searcher.Get())
                    {
                        clockSpeed = $"{item["MaxClockSpeed"]} MHz";
                        break;
                    }
                }
            }
            catch { }

            CpuInfoText.Text = $"Ядер (логических): {cores}\nТактовая частота: {clockSpeed}";
        }

        private void BtnRun_Click(object sender, RoutedEventArgs e)
        {
            if (!int.TryParse(TxtNa.Text, out int Na) ||
                !int.TryParse(TxtNthreads.Text, out int Nthreads) ||
                !int.TryParse(TxtK.Text, out int K) ||
                !int.TryParse(TxtDeltaThreads.Text, out int deltaThreads) ||
                !int.TryParse(TxtDeltaK.Text, out int deltaK) ||
                deltaThreads <= 0 || deltaK <= 0 || Nthreads <= 0)
            {
                MessageBox.Show("Заполните корректные числовые параметры.");
                return;
            }

            double[] a = new double[Na];
            Random rnd = new Random();
            for (int i = 0; i < Na; i++) a[i] = rnd.NextDouble();

            long singleTime = MeasureSingleThread(a, K);

            int threadSteps = Nthreads / deltaThreads;
            PointData[] g1Thread = new PointData[threadSteps];
            PointData[] g1Task = new PointData[threadSteps];

            for (int i = 0; i < threadSteps; i++)
            {
                int tCount = (i + 1) * deltaThreads;
                g1Thread[i] = new PointData { X = tCount, Y = MeasureMultiThread(a, K, tCount) };
                g1Task[i] = new PointData { X = tCount, Y = MeasureTask(a, K, tCount) };
            }

            int fixedThreads = Nthreads >= 2 ? 2 : 1;
            int kSteps = 5;
            PointData[] g2Thread = new PointData[kSteps];
            PointData[] g2Task = new PointData[kSteps];

            for (int i = 0; i < kSteps; i++)
            {
                int currentK = K + i * deltaK;
                g2Thread[i] = new PointData { X = currentK, Y = MeasureMultiThread(a, currentK, fixedThreads) };
                g2Task[i] = new PointData { X = currentK, Y = MeasureTask(a, currentK, fixedThreads) };
            }

            DrawGraph(CanvasGraph1, g1Thread, g1Task, "Потоки", "мс");
            DrawGraph(CanvasGraph2, g2Thread, g2Task, "K", "мс");

            PointData p1 = g1Thread[0];
            PointData p2 = g1Thread[g1Thread.Length - 1];
            PointData p3 = g2Thread[0];
            PointData p4 = g2Thread[g2Thread.Length - 1];

            TxtResults.Text = $"Однопоточный расчет: {singleTime} мс\n" +
                              $"Многопоточный (Thread, N_tr={Nthreads}): {g1Thread[g1Thread.Length - 1].Y} мс\n" +
                              $"Многопоточный (Task, N_tr={Nthreads}): {g1Task[g1Task.Length - 1].Y} мс\n\n" +
                              $"Точка 1 (G1 Thread Min): X={p1.X}, Y={p1.Y} мс\n" +
                              $"Точка 2 (G1 Thread Max): X={p2.X}, Y={p2.Y} мс\n" +
                              $"Точка 3 (G2 Thread Min): X={p3.X}, Y={p3.Y} мс\n" +
                              $"Точка 4 (G2 Thread Max): X={p4.X}, Y={p4.Y} мс";
        }

        private long MeasureSingleThread(double[] a, int K)
        {
            double[] b = new double[a.Length];
            Stopwatch sw = Stopwatch.StartNew();
            for (int i = 0; i < a.Length; i++)
            {
                for (int j = 0; j < K; j++)
                    b[i] += Math.Pow(a[i], 1.789);
            }
            sw.Stop();
            return sw.ElapsedMilliseconds;
        }

        private long MeasureMultiThread(double[] a, int K, int threadCount)
        {
            double[] b = new double[a.Length];
            Thread[] threads = new Thread[threadCount];
            int chunkSize = a.Length / threadCount;

            Stopwatch sw = Stopwatch.StartNew();
            for (int t = 0; t < threadCount; t++)
            {
                int start = t * chunkSize;
                int end = (t == threadCount - 1) ? a.Length : start + chunkSize;

                threads[t] = new Thread(() =>
                {
                    for (int i = start; i < end; i++)
                    {
                        for (int j = 0; j < K; j++)
                            b[i] += Math.Pow(a[i], 1.789);
                    }
                });
                threads[t].Start();
            }

            for (int t = 0; t < threadCount; t++) threads[t].Join();
            sw.Stop();

            return sw.ElapsedMilliseconds;
        }

        private long MeasureTask(double[] a, int K, int taskCount)
        {
            double[] b = new double[a.Length];
            Task[] tasks = new Task[taskCount];
            int chunkSize = a.Length / taskCount;

            Stopwatch sw = Stopwatch.StartNew();
            for (int t = 0; t < taskCount; t++)
            {
                int start = t * chunkSize;
                int end = (t == taskCount - 1) ? a.Length : start + chunkSize;

                tasks[t] = Task.Run(() =>
                {
                    for (int i = start; i < end; i++)
                    {
                        for (int j = 0; j < K; j++)
                            b[i] += Math.Pow(a[i], 1.789);
                    }
                });
            }

            Task.WaitAll(tasks);
            sw.Stop();

            return sw.ElapsedMilliseconds;
        }

        private void DrawGraph(Canvas canvas, PointData[] threadPoints, PointData[] taskPoints, string xLabel, string yLabel)
        {
            canvas.Children.Clear();
            if (canvas.ActualWidth <= 0 || canvas.ActualHeight <= 0) return;

            double margin = 30;
            double w = canvas.ActualWidth - 2 * margin;
            double h = canvas.ActualHeight - 2 * margin;

            double maxX = threadPoints[threadPoints.Length - 1].X;
            double minX = threadPoints[0].X;
            double maxY = 0;

            foreach (var p in threadPoints) if (p.Y > maxY) maxY = p.Y;
            foreach (var p in taskPoints) if (p.Y > maxY) maxY = p.Y;
            if (maxY == 0) maxY = 1;

            Line xAxis = new Line { X1 = margin, Y1 = canvas.ActualHeight - margin, X2 = canvas.ActualWidth - margin, Y2 = canvas.ActualHeight - margin, Stroke = Brushes.Black, StrokeThickness = 1 };
            Line yAxis = new Line { X1 = margin, Y1 = margin, X2 = margin, Y2 = canvas.ActualHeight - margin, Stroke = Brushes.Black, StrokeThickness = 1 };
            canvas.Children.Add(xAxis);
            canvas.Children.Add(yAxis);

            DrawSeries(canvas, threadPoints, Brushes.Red, minX, maxX, maxY, margin, w, h);
            DrawSeries(canvas, taskPoints, Brushes.Blue, minX, maxX, maxY, margin, w, h);
        }

        private void DrawSeries(Canvas canvas, PointData[] points, Brush color, double minX, double maxX, double maxY, double margin, double w, double h)
        {
            for (int i = 0; i < points.Length - 1; i++)
            {
                double x1 = margin + (points[i].X - minX) / (maxX == minX ? 1 : maxX - minX) * w;
                double y1 = canvas.ActualHeight - margin - (points[i].Y / maxY) * h;

                double x2 = margin + (points[i + 1].X - minX) / (maxX == minX ? 1 : maxX - minX) * w;
                double y2 = canvas.ActualHeight - margin - (points[i + 1].Y / maxY) * h;

                Line line = new Line { X1 = x1, Y1 = y1, X2 = x2, Y2 = y2, Stroke = color, StrokeThickness = 2 };
                canvas.Children.Add(line);

                Ellipse ellipse = new Ellipse { Width = 6, Height = 6, Fill = color };
                Canvas.SetLeft(ellipse, x1 - 3);
                Canvas.SetTop(ellipse, y1 - 3);
                canvas.Children.Add(ellipse);
            }

            if (points.Length > 0)
            {
                double lastX = margin + (points[points.Length - 1].X - minX) / (maxX == minX ? 1 : maxX - minX) * w;
                double lastY = canvas.ActualHeight - margin - (points[points.Length - 1].Y / maxY) * h;
                Ellipse ellipse = new Ellipse { Width = 6, Height = 6, Fill = color };
                Canvas.SetLeft(ellipse, lastX - 3);
                Canvas.SetTop(ellipse, lastY - 3);
                canvas.Children.Add(ellipse);
            }
        }

        private void Canvas_SizeChanged(object sender, SizeChangedEventArgs e)
        {
            if (BtnRun.IsLoaded) BtnRun_Click(null, null);
        }
    }
}