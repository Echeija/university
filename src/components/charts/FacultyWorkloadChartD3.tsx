import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

interface FacultyWorkloadChartProps {
  data: { category: string; value: number }[];
}

export default function FacultyWorkloadChartD3({ data }: FacultyWorkloadChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current || !data || data.length === 0) return;

    d3.select(chartRef.current).selectAll('*').remove();

    const width = chartRef.current.clientWidth;
    const height = chartRef.current.clientHeight;
    const margin = 20;

    const radius = Math.min(width, height) / 2 - margin;

    const svg = d3
      .select(chartRef.current)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    const color = d3.scaleOrdinal<string>()
      .domain(data.map(d => d.category))
      .range(['#10b981', '#8b5cf6', '#f59e0b', '#64748b']);

    const pie = d3.pie<{ category: string; value: number }>()
      .value((d) => d.value)
      .sort(null);

    const arc = d3.arc<d3.PieArcDatum<{ category: string; value: number }>>()
      .innerRadius(radius * 0.6)
      .outerRadius(radius);

    const arcs = svg.selectAll('arc')
      .data(pie(data))
      .enter()
      .append('g')
      .attr('class', 'arc');

    arcs.append('path')
      .attr('d', arc)
      .attr('fill', (d) => color(d.data.category))
      .attr('stroke', 'white')
      .style('stroke-width', '2px')
      .style('cursor', 'pointer');

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
      .style('box-shadow', '0 4px 6px -1px rgba(0, 0, 0, 0.1)')
      .style('z-index', '10');

    arcs.on('mouseover', function (event, d) {
        d3.select(this).select('path').style('opacity', 0.8);
        tooltip.style('visibility', 'visible')
          .text(`${d.data.category}: ${d.data.value}%`);
      })
      .on('mousemove', function (event) {
        tooltip.style('top', (event.pageY - 10) + 'px')
               .style('left', (event.pageX + 10) + 'px');
      })
      .on('mouseout', function () {
        d3.select(this).select('path').style('opacity', 1);
        tooltip.style('visibility', 'hidden');
      });

  }, [data]);

  return (
    <div className="w-full h-full flex flex-col relative">
      <div ref={chartRef} className="w-full flex-1 min-h-0 relative"></div>
      <div className="w-full flex flex-wrap justify-center gap-3 mt-4">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300">
            <span 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: ['#10b981', '#8b5cf6', '#f59e0b', '#64748b'][i % 4] }}
            />
            {d.category}
          </div>
        ))}
      </div>
    </div>
  );
}
