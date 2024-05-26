"use client";

import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

interface Version {
  hash: string;
  message: string;
  timestamp: number;
  parent?: string;
}

interface VersionGraphProps {
  versions: Version[];
}

export function VersionGraph({ versions }: VersionGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || versions.length === 0) return;

    const width = 600;
    const height = 400;
    const nodeRadius = 5;

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height);

    svg.selectAll("*").remove();

    const simulation = d3
      .forceSimulation(versions as d3.SimulationNodeDatum[])
      .force(
        "link",
        d3
          .forceLink()
          .id((d: any) => d.hash)
          .distance(50)
      )
      .force("charge", d3.forceManyBody().strength(-100))
      .force("center", d3.forceCenter(width / 2, height / 2));

    const links = svg
      .append("g")
      .selectAll("line")
      .data(versions.filter((v) => v.parent))
      .enter()
      .append("line")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", 1);

    const nodes = svg
      .append("g")
      .selectAll("circle")
      .data(versions)
      .enter()
      .append("circle")
      .attr("r", nodeRadius)
      .attr("fill", "#69b3a2");

    const labels = svg
      .append("g")
      .selectAll("text")
      .data(versions)
      .enter()
      .append("text")
      .text((d) => d.message.substring(0, 20))
      .attr("font-size", 10)
      .attr("dx", 8)
      .attr("dy", 3);

    simulation.on("tick", () => {
      links
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      nodes.attr("cx", (d: any) => d.x).attr("cy", (d: any) => d.y);

      labels.attr("x", (d: any) => d.x).attr("y", (d: any) => d.y);
    });
  }, [versions]);

  return <svg ref={svgRef}></svg>;
}
