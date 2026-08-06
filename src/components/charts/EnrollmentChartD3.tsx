import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

interface EnrollmentChartProps {
  data: { month: string; enrollments: number }[];
}

export default function EnrollmentChartD3({ data }: EnrollmentChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current || !data || data.length === 0) return;

    // Clear previous chart
    d3.select(chartRef.current).selectAll('*').remove();

    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const width = chartRef.current.clientWidth - margin.left - margin.right;
    const height = chartRef.current.clientHeight - margin.top - margin.bottom;

    const svg = d3
      .select(chartRef.current)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3
      .scalePoint()
      .domain(data.map((d) => d.month))
      .range([0, width])
      .padding(0.1);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.enrollments) || 0])
      .nice()
      .range([height, 0]);

    // X Axis
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .attr('class', 'text-slate-500 text-xs');

    // Y Axis
    svg.append('g')
      .call(d3.axisLeft(y).ticks(5))
      .attr('class', 'text-slate-500 text-xs');

    // Remove domain lines for cleaner look
    svg.selectAll('.domain').remove();
    svg.selectAll('.tick line').attr('stroke', '#e2e8f0');

    // Area
    const area = d3.area<{ month: string; enrollments: number }>()
      .x((d) => x(d.month) || 0)
      .y0(height)
      .y1((d) => y(d.enrollments))
      .curve(d3.curveMonotoneX);

    svg.append('path')
      .datum(data)
      .attr('fill', 'rgba(16, 185, 129, 0.2)')
      .attr('d', area);

    // Line
    const line = d3.line<{ month: string; enrollments: number }>()
      .x((d) => x(d.month) || 0)
      .y((d) => y(d.enrollments))
      .curve(d3.curveMonotoneX);

    svg.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#10b981')
      .attr('stroke-width', 3)
      .attr('d', line);

    // Dots
    svg.selectAll('.dot')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('cx', (d) => x(d.month) || 0)
      .attr('cy', (d) => y(d.enrollments))
      .attr('r', 5)
      .attr('fill', '#10b981')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);
      
    // Tooltip setup (basic)
    const tooltip = d3.select(chartRef.current)
      .append('div')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background', '#fff')
      .style('border', '1px solid #e2e8f0')
      .style('border-radius', '6px')
      .style('padding', '8px')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .style('box-shadow', '0 4px 6px -1px rgba(0, 0, 0, 0.1)');

    svg.selectAll('.dot')
      .on('mouseover', function (event, d: any) {
        d3.select(this).attr('r', 7);
        tooltip.style('visibility', 'visible')
          .text(`${d.month}: ${d.enrollments}`);
      })
      .on('mousemove', function (event) {
        tooltip.style('top', (event.pageY - 10) + 'px')
               .style('left', (event.pageX + 10) + 'px');
      })
      .on('mouseout', function () {
        d3.select(this).attr('r', 5);
        tooltip.style('visibility', 'hidden');
      });

    // Resize handler
    const handleResize = () => {
      // Re-render
      d3.select(chartRef.current).selectAll('*').remove();
      // A full React re-render would be ideal, but for simplicity here we just trigger one via state or just let the window resize handle it if wrapped in a responsive container.
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);

  }, [data]);

  return <div ref={chartRef} className="w-full h-full relative"></div>;
}
