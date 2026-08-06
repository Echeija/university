import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

interface GraduationRatesChartProps {
  data: { year: string; rate: number }[];
}

export default function GraduationRatesChartD3({ data }: GraduationRatesChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current || !data || data.length === 0) return;

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
      .scaleBand()
      .domain(data.map((d) => d.year))
      .range([0, width])
      .padding(0.3);

    const y = d3
      .scaleLinear()
      .domain([0, 100]) // Rate up to 100%
      .range([height, 0]);

    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .attr('class', 'text-slate-500 text-xs');

    svg.append('g')
      .call(d3.axisLeft(y).ticks(5).tickFormat(d => d + '%'))
      .attr('class', 'text-slate-500 text-xs');

    svg.selectAll('.domain').remove();
    svg.selectAll('.tick line').attr('stroke', '#e2e8f0');

    // Add bars
    svg.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d) => x(d.year) || 0)
      .attr('y', (d) => y(d.rate))
      .attr('width', x.bandwidth())
      .attr('height', (d) => height - y(d.rate))
      .attr('fill', '#3b82f6')
      .attr('rx', 4);

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

    svg.selectAll('.bar')
      .on('mouseover', function (event, d: any) {
        d3.select(this).attr('fill', '#2563eb');
        tooltip.style('visibility', 'visible')
          .text(`${d.year}: ${d.rate}%`);
      })
      .on('mousemove', function (event) {
        tooltip.style('top', (event.pageY - 10) + 'px')
               .style('left', (event.pageX + 10) + 'px');
      })
      .on('mouseout', function () {
        d3.select(this).attr('fill', '#3b82f6');
        tooltip.style('visibility', 'hidden');
      });

  }, [data]);

  return <div ref={chartRef} className="w-full h-full relative"></div>;
}
