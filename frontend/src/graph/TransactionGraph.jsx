import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'

const GRAPH_HEIGHT = 380

// Exact taxonomy from docs/visual_identity.md
function getNodeColor(node) {
  if (node.risk && ['HIGH', 'CRITICAL'].includes(String(node.risk).toUpperCase())) {
    return '#EF4444' // Crimson Red
  }
  if (node.type === 'target' || node.hop === 0) return '#F59E0B' // Amber Gold
  if (node.type === 'vasp') return '#10B981' // Emerald Mint
  if (node.hop === 1) return '#3B82F6' // Electric Blue
  if (node.hop === 2) return '#8B5CF6' // Violet Purple
  if (node.hop === 3) return '#06B6D4' // Cyan Teal
  return '#64748B' // Steel Slate
}

function getNodeRadius(node) {
  if (node.risk && ['HIGH', 'CRITICAL'].includes(String(node.risk).toUpperCase())) return 14
  if (node.type === 'target' || node.hop === 0) return 15
  if (node.type === 'vasp') return 14
  if (node.hop === 1) return 11
  if (node.hop === 2 || node.hop === 3) return 10
  return 9
}

function getNodeStroke(node) {
  if (node.risk && ['HIGH', 'CRITICAL'].includes(String(node.risk).toUpperCase())) return '#FECACA'
  if (node.type === 'target' || node.hop === 0) return '#FDE68A'
  if (node.type === 'vasp') return '#A7F3D0'
  if (node.hop === 1) return '#93C5FD'
  if (node.hop === 2) return '#C4B5FD'
  if (node.hop === 3) return '#67E8F9'
  return '#94A3B8'
}

function formatNodeLabel(node) {
  if (node.type === 'target' || node.hop === 0) return 'Target (Origin)'
  if (node.label && node.label !== node.id) {
    return node.label.length > 26 ? `${node.label.slice(0, 24)}...` : node.label
  }
  if (node.id && node.id.length > 14) {
    return `${node.id.slice(0, 6)}...${node.id.slice(-4)}`
  }
  return node.id || 'Unknown'
}

function getGraphData(graphData) {
  if (!graphData || !Array.isArray(graphData.nodes) || !Array.isArray(graphData.edges)) {
    return { nodes: [], edges: [] }
  }

  const nodes = graphData.nodes
    .filter((node) => node && node.id != null)
    .map((node) => ({ ...node }))

  const nodeMap = new Set(nodes.map((n) => n.id))

  const edges = graphData.edges
    .filter((edge) => {
      if (!edge) return false
      const sourceId = typeof edge.source === 'object' ? edge.source.id : edge.source
      const targetId = typeof edge.target === 'object' ? edge.target.id : edge.target
      return sourceId && targetId && nodeMap.has(sourceId) && nodeMap.has(targetId)
    })
    .map((edge) => ({
      ...edge,
      source: typeof edge.source === 'object' ? edge.source.id : edge.source,
      target: typeof edge.target === 'object' ? edge.target.id : edge.target,
    }))

  return { nodes, edges }
}

function TransactionGraph({ data }) {
  const containerRef = useRef(null)
  const svgRef = useRef(null)
  const [hoveredNode, setHoveredNode] = useState(null)

  useEffect(() => {
    const container = containerRef.current
    const svgElement = svgRef.current
    if (!container || !svgElement) return undefined

    const { nodes, edges } = getGraphData(data)
    const width = Math.max(container.clientWidth || 0, 420)
    const svg = d3.select(svgElement)
    svg.selectAll('*').remove()

    if (!nodes.length) {
      svg.attr('viewBox', `0 0 ${width} ${GRAPH_HEIGHT}`)
      return undefined
    }

    svg.attr('viewBox', `0 0 ${width} ${GRAPH_HEIGHT}`)

    // Defs for glow filters & arrowheads
    const defs = svg.append('defs')

    // Arrowhead marker
    defs.append('marker')
      .attr('id', 'ct-arrowhead')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 22)
      .attr('refY', 0)
      .attr('markerWidth', 7)
      .attr('markerHeight', 7)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-4L8,0L0,4')
      .attr('fill', '#64748b')

    const layer = svg.append('g').attr('class', 'graph-layer')

    // Links / Edges
    const link = layer.append('g')
      .attr('class', 'transaction-links')
      .selectAll('line')
      .data(edges)
      .join('line')
      .attr('stroke', '#475569')
      .attr('stroke-width', 2)
      .attr('stroke-opacity', 0.85)
      .attr('marker-end', 'url(#ct-arrowhead)')

    // Initialize initial coordinate spread so nodes never overlap on tick 0
    nodes.forEach((n, i) => {
      if (n.x == null) n.x = width / 2 + (i % 2 === 0 ? -90 : 90) * Math.ceil((i + 1) / 2)
      if (n.y == null) n.y = GRAPH_HEIGHT / 2 + (i % 2 === 0 ? -30 : 30)
    })

    // Node groups
    const node = layer.append('g')
      .attr('class', 'transaction-nodes')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .style('cursor', 'pointer')
      .on('mouseenter', (event, d) => setHoveredNode(d))
      .on('mouseleave', () => setHoveredNode(null))

    // Node circles
    node.append('circle')
      .attr('r', getNodeRadius)
      .attr('fill', getNodeColor)
      .attr('stroke', getNodeStroke)
      .attr('stroke-width', (d) => (d.type === 'target' || d.type === 'vasp' || d.risk === 'HIGH' ? 2.5 : 1.5))
      .style('filter', (d) => {
        if (d.risk === 'HIGH') return 'drop-shadow(0 0 10px rgba(239, 68, 68, 0.7))'
        if (d.type === 'target' || d.hop === 0) return 'drop-shadow(0 0 10px rgba(245, 158, 11, 0.55))'
        if (d.type === 'vasp') return 'drop-shadow(0 0 10px rgba(16, 185, 129, 0.55))'
        return 'none'
      })

    // Text labels
    node.append('text')
      .attr('x', 16)
      .attr('y', 5)
      .attr('fill', '#f8fafc')
      .attr('font-family', 'Manrope, sans-serif')
      .attr('font-size', 11)
      .attr('font-weight', (d) => (d.type === 'target' || d.type === 'vasp' ? 700 : 500))
      .text(formatNodeLabel)

    // Force simulation
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(edges).id((d) => d.id).distance(110).strength(0.85))
      .force('charge', d3.forceManyBody().strength(-280))
      .force('center', d3.forceCenter(width / 2, GRAPH_HEIGHT / 2))
      .force('collision', d3.forceCollide().radius(44))
      .on('tick', () => {
        // Constrain within bounding box
        nodes.forEach((d) => {
          d.x = Math.max(40, Math.min(width - 40, d.x))
          d.y = Math.max(35, Math.min(GRAPH_HEIGHT - 35, d.y))
        })

        link
          .attr('x1', (d) => d.source.x)
          .attr('y1', (d) => d.source.y)
          .attr('x2', (d) => d.target.x)
          .attr('y2', (d) => d.target.y)

        node.attr('transform', (d) => `translate(${d.x},${d.y})`)
      })

    // Resize observer
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries.length) return
      const nextWidth = Math.max(entries[0].contentRect.width, 420)
      svg.attr('viewBox', `0 0 ${nextWidth} ${GRAPH_HEIGHT}`)
      simulation.force('center').x(nextWidth / 2)
      simulation.alpha(0.2).restart()
    })
    resizeObserver.observe(container)

    return () => {
      resizeObserver.disconnect()
      simulation.stop()
      svg.selectAll('*').remove()
    }
  }, [data])

  const { nodes, edges } = getGraphData(data)

  return (
    <div className="transaction-graph-card" ref={containerRef} aria-label="Transaction graph">
      {/* Visual Identity Legend */}
      <div className="graph-legend print-exclude">
        <span className="legend-item"><span className="legend-dot target" /> Target (Hop 0)</span>
        <span className="legend-item"><span className="legend-dot hop1" /> Hop 1</span>
        <span className="legend-item"><span className="legend-dot hop2" /> Hop 2</span>
        <span className="legend-item"><span className="legend-dot vasp" /> Identified VASP</span>
        <span className="legend-item"><span className="legend-dot risk" /> OFAC / Sanctioned</span>
      </div>

      {/* SVG Canvas */}
      <div className="graph-canvas-wrap">
        <svg ref={svgRef} role="img" aria-label="Directed transaction graph" />
      </div>

      {/* Hover Information Chip */}
      <div className="graph-footer-bar">
        {hoveredNode ? (
          <div className="node-inspect-chip">
            <span className="inspect-badge" style={{ backgroundColor: getNodeColor(hoveredNode) }}>
              {hoveredNode.type ? hoveredNode.type.toUpperCase() : `HOP ${hoveredNode.hop ?? 0}`}
            </span>
            <span className="inspect-addr">{hoveredNode.id}</span>
            {hoveredNode.label && hoveredNode.label !== hoveredNode.id && (
              <span className="inspect-label">({hoveredNode.label})</span>
            )}
            {hoveredNode.risk === 'HIGH' && <span className="inspect-risk">⚠️ SANCTIONED</span>}
          </div>
        ) : (
          <span className="graph-stats-hint">
            Hover over nodes to inspect cryptographic identity · {nodes.length} nodes · {edges.length} directed edges
          </span>
        )}
      </div>
    </div>
  )
}

export default TransactionGraph