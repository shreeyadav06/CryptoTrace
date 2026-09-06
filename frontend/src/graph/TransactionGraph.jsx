import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

const GRAPH_HEIGHT = 360

function getNodeColor(node) {
  if (node.risk && ['HIGH', 'CRITICAL'].includes(String(node.risk).toUpperCase())) {
    return '#ef4444'
  }

  if (node.type === 'target') return '#f5c84b'
  if (node.type === 'vasp') return '#41d392'
  if (node.hop === 1 || node.hop === 2 || node.type === 'wallet') return '#60a5fa'
  return '#8b98ad'
}

function getGraphData(graphData) {
  if (!graphData || !Array.isArray(graphData.nodes) || !Array.isArray(graphData.edges)) {
    return { nodes: [], edges: [] }
  }

  return {
    nodes: graphData.nodes.filter((node) => node && node.id != null).map((node) => ({ ...node })),
    edges: graphData.edges.filter((edge) => edge && edge.source != null && edge.target != null).map((edge) => ({ ...edge })),
  }
}

function TransactionGraph({ data }) {
  const containerRef = useRef(null)
  const svgRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    const svgElement = svgRef.current
    if (!container || !svgElement) return undefined

    const { nodes, edges } = getGraphData(data)
    const width = Math.max(container.clientWidth, 280)
    const svg = d3.select(svgElement)
    svg.selectAll('*').remove()

    if (!nodes.length) {
      svg.attr('viewBox', `0 0 ${width} ${GRAPH_HEIGHT}`)
      return undefined
    }

    svg.attr('viewBox', `0 0 ${width} ${GRAPH_HEIGHT}`)

    const defs = svg.append('defs')
    defs.append('marker')
      .attr('id', 'transaction-arrowhead')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 10)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#8b98ad')

    const layer = svg.append('g')
    const link = layer.append('g')
      .attr('class', 'transaction-links')
      .selectAll('line')
      .data(edges)
      .join('line')
      .attr('stroke', '#52627a')
      .attr('stroke-width', 1.5)
      .attr('marker-end', 'url(#transaction-arrowhead)')

    const node = layer.append('g')
      .attr('class', 'transaction-nodes')
      .selectAll('g')
      .data(nodes)
      .join('g')

    node.append('circle')
      .attr('r', (item) => item.type === 'target' ? 11 : 8)
      .attr('fill', getNodeColor)
      .attr('stroke', '#0b0f19')
      .attr('stroke-width', 3)

    node.append('text')
      .attr('x', 14)
      .attr('y', 4)
      .attr('fill', '#dbe5f2')
      .attr('font-family', 'Manrope, sans-serif')
      .attr('font-size', 11)
      .text((item) => item.label || item.id)

    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(edges).id((item) => item.id).distance(105).strength(0.9))
      .force('charge', d3.forceManyBody().strength(-260))
      .force('center', d3.forceCenter(width / 2, GRAPH_HEIGHT / 2))
      .force('collision', d3.forceCollide().radius(34))
      .on('tick', () => {
        link
          .attr('x1', (edge) => edge.source.x)
          .attr('y1', (edge) => edge.source.y)
          .attr('x2', (edge) => edge.target.x)
          .attr('y2', (edge) => edge.target.y)

        node.attr('transform', (item) => `translate(${item.x},${item.y})`)
      })

    const resizeObserver = new ResizeObserver((entries) => {
      const nextWidth = Math.max(entries[0].contentRect.width, 280)
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

  return (
    <div className="transaction-graph" ref={containerRef} aria-label="Transaction graph">
      <svg ref={svgRef} role="img" aria-label="Directed transaction graph" />
    </div>
  )
}

export default TransactionGraph