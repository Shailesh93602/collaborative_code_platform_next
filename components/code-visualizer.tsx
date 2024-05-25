"use client";

import { useState, useEffect, useRef } from "react";
import { select } from "d3-selection";
import { hierarchy, tree } from "d3-hierarchy";
import { linkHorizontal } from "d3-shape";
import { parse } from "@babel/parser";
import traverse from "@babel/traverse";

interface ASTNode {
  type: string;
  name?: string;
  value?: string;
  children?: ASTNode[];
}

function parseCode(code: string): ASTNode {
  const ast = parse(code, {
    sourceType: "module",
    plugins: ["jsx", "typescript"],
  });

  const root: ASTNode = { type: "Program", children: [] };

  traverse(ast, {
    enter(path) {
      const node: ASTNode = { type: path.node.type };

      if ("id" in path.node && path.node.id && "name" in path.node.id) {
        node.name = path.node.id.name;
      }

      if ("value" in path.node && typeof path.node.value === "string") {
        node.value = path.node.value;
      }

      if (!path.parent) {
        root.children = [node];
      } else {
        const parent = path.findParent((p) => p.node._astNode)?.node
          ._astNode as ASTNode;
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(node);
        }
      }

      path.node._astNode = node;
    },
  });

  return root;
}

export function CodeVisualizer({ code }: { code: string }) {
  const [ast, setAst] = useState<ASTNode | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const parsedAST = parseCode(code);
    setAst(parsedAST);
  }, [code]);

  useEffect(() => {
    if (ast && svgRef.current) {
      renderTree(ast);
    }
  }, [ast]);

  const renderTree = (data: ASTNode) => {
    const width = 600;
    const height = 400;
    const margin = { top: 20, right: 90, bottom: 30, left: 90 };

    select(svgRef.current).selectAll("*").remove();

    const svg = select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const root = hierarchy(data);
    const treeLayout = tree<ASTNode>().size([height, width - 200]);
    const treeData = treeLayout(root);

    const link = linkHorizontal<any, any>()
      .x((d) => d.y)
      .y((d) => d.x);

    svg
      .selectAll(".link")
      .data(treeData.links())
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("d", link)
      .attr("fill", "none")
      .attr("stroke", "#555")
      .attr("stroke-opacity", 0.4)
      .attr("stroke-width", 1.5);

    const node = svg
      .selectAll(".node")
      .data(treeData.descendants())
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", (d) => `translate(${d.y},${d.x})`);

    node.append("circle").attr("r", 5).attr("fill", "#69b3a2");

    node
      .append("text")
      .attr("dy", ".35em")
      .attr("x", (d) => (d.children ? -13 : 13))
      .attr("text-anchor", (d) => (d.children ? "end" : "start"))
      .text((d) => d.data.name || d.data.type);
  };

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <h2 className="text-2xl font-semibold">Code Visualization</h2>
      <div className="w-full h-[400px] overflow-auto">
        <svg ref={svgRef}></svg>
      </div>
    </div>
  );
}
