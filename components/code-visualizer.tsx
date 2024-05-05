"use client";

import { useState, useEffect } from "react";
import { select } from "d3-selection";
import { hierarchy, tree } from "d3-hierarchy";
import { linkHorizontal } from "d3-shape";

interface ASTNode {
  type: string;
  name?: string;
  value?: string;
  children?: ASTNode[];
}

function simpleParse(code: string): ASTNode {
  const lines = code.split("\n");
  const root: ASTNode = { type: "Program", children: [] };
  let currentFunction: ASTNode | null = null;

  lines.forEach((line) => {
    if (line.trim().startsWith("function")) {
      const functionName = line.match(/function\s+(\w+)/)?.[1] ?? "anonymous";
      currentFunction = {
        type: "FunctionDeclaration",
        name: functionName,
        children: [],
      };
      root.children?.push(currentFunction);
    } else if (line.includes("=")) {
      const [name, value] = line.split("=").map((s) => s.trim());
      const node: ASTNode = { type: "VariableDeclaration", name, value };
      if (currentFunction) {
        currentFunction.children?.push(node);
      } else {
        root.children?.push(node);
      }
    }
  });

  return root;
}

export function CodeVisualizer({ code }: { readonly code: string }) {
  const [ast, setAst] = useState<ASTNode | null>(null);

  useEffect(() => {
    const parsedAST = simpleParse(code);
    setAst(parsedAST);
  }, [code]);

  useEffect(() => {
    if (ast) {
      renderTree(ast);
    }
  }, [ast]);

  const renderTree = (data: ASTNode) => {
    const width = 600;
    const height = 400;
    const margin = { top: 20, right: 90, bottom: 30, left: 90 };

    select("#tree-container").selectAll("*").remove();

    const svg = select("#tree-container")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const root = hierarchy(data);
    const treeLayout = tree<ASTNode>().size([height, width - 200]);
    const treeData = treeLayout(root);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      <div id="tree-container" className="w-full h-[400px] overflow-auto"></div>
    </div>
  );
}
