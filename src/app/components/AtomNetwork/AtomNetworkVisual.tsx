import React, {useState, useEffect} from 'react';
import * as d3 from 'd3';
import makeRelationshipLinks from '../../utils/makeRelationshipLinks';
import {filteredSnapshot} from '../../../types/index';

interface AtomVisualProps {
  filteredCurSnap: filteredSnapshot;
  searchValue: string;
}

const AtomNetworkVisual: React.FC<AtomVisualProps> = ({
  filteredCurSnap,
  searchValue,
}) => {
  // state hook for keeping the zoom consistent despite rerenders
  // const [{x, y, k}, setZoomState] = useState({x: 0, y: 0, k: 0});

  // useEffect(() => {
  //   setZoomState(d3.zoomTransform(d3.select('#networkCanvas').node()));
  // }, [filteredCurSnap]);

  useEffect(() => {
    // new filtered snap object to be constructed with search value
    const newFilteredCurSnap: any = {};

    // filters filteredCurSnap object with atoms and selectors that includes are search value
    const filter = (filteredCurSnap: filteredSnapshot) => {
      for (let key in filteredCurSnap) {
        if (key.toLowerCase().includes(searchValue.toLowerCase())) {
          newFilteredCurSnap[key] = filteredCurSnap[key];
          grabNodeToNodeSubscriptions(newFilteredCurSnap[key]);
          grabNodeDeps(newFilteredCurSnap[key]);
        }
      }
    };

    // helper functions to recursively include searched atoms/selectors' subscriptions
    const grabNodeToNodeSubscriptions = (node: any) => {
      let nodeSubscriptionLength = node.nodeToNodeSubscriptions.length;
      if (nodeSubscriptionLength > 0) {
        for (let i = 0; i < nodeSubscriptionLength; i += 1) {
          let currSN = node.nodeToNodeSubscriptions[i];
          newFilteredCurSnap[currSN] = filteredCurSnap[currSN];
          grabNodeToNodeSubscriptions(filteredCurSnap[currSN]);
        }
      }
    };
    const grabNodeDeps = (node: any) => {
      let nodeDepsLength = node.nodeDeps.length;
      if (nodeDepsLength > 0) {
        for (let i = 0; i < nodeDepsLength; i += 1) {
          let currDepNode = node.nodeDeps[i];
          newFilteredCurSnap[currDepNode] = filteredCurSnap[currDepNode];
          grabNodeDeps(filteredCurSnap[currDepNode]);
        }
      }
    };

    // invoke filter to populate newFilteredCurSnap
    filter(filteredCurSnap);
    document.getElementById('networkCanvas').innerHTML = '';

    let link: any;
    let node: any;
    let edgepaths: any;
    let edgelabels: any;

    const networkContainer = document.querySelector('.networkContainer');
    const width = networkContainer.clientWidth;
    const height = networkContainer.clientHeight;
    const svg = d3.select('#networkCanvas');

    // const g = svg;
    //   .append('g')
    //   .attr('transform', `translate(${x}, ${y}), scale(${k})`); // sets the canvas to the saved zoomState

    // const markers = g
    //   .append('defs')
    //   .append('marker')
    //   .attr('id', 'arrowhead')
    //   .attr('viewBox', '-0 -5 10 10')
    //   .attr('refX', 13)
    //   .attr('refY', 0)
    //   .attr('orient', 'auto')
    //   .attr('markerWidth', 7)
    //   .attr('markerHeight', 7)
    //   .attr('xoverflow', 'visible')
    //   .append('svg:path')
    //   .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
    //   .attr('fill', '#474747')
    //   .style('stroke', 'none');

    // const simulation = d3
    //   .forceSimulation()
    //   .force(
    //     'link',
    //     d3
    //       .forceLink()
    //       .id(function (d: any) {
    //         return d.id;
    //       })
    //       .distance(100)
    //       .strength(1),
    //   )
    // //make the nodes repel each other by assigning negative charge
    // .force('charge', d3.forceManyBody().strength(-30))
    // // .force('charge', d3.forceManyBody())
    // .force('center', d3.forceCenter(width / 2, height / 2))
    // //prevent the nodes from overlapping
    // .force('collide',d3.forceCollide().radius(35).iterations(2));

    // snap will be newFilteredCurSnap if searchValue exists, if not original
    let snap: any = searchValue ? newFilteredCurSnap : filteredCurSnap;

    // TRANSFORM DATA INTO D3 SUPPORTED FORMAT FOR NETWORK GRAPH
    const networkData: any = makeRelationshipLinks(snap);
    // // MAIN UPDATE CALL
    // update(networkData.links, networkData.nodes);
    // // HELPER FUNCTIONS BELOW FOR D3
    // function update(links: any, nodes: any) {
    //   link = g
    //     .selectAll('.link')
    //     .data(links)
    //     .enter()
    //     .append('line')
    //     .attr('class', 'link')
    //     .attr('marker-end', 'url(#arrowhead)');
    //   link.append('title').text(function (d: any) {
    //     return d.type;
    //   });
    //   edgepaths = g
    //     .selectAll('.edgepath')
    //     .data(links)
    //     .enter()
    //     .append('path')
    //     .attr('class', 'edgepath')
    //     .attr('fill-opacity', '1.0')
    //     .attr('stroke-opacity', '1.0')
    //     .attr('id', function (d: any, i: any) {
    //       return 'edgepath' + i;
    //     })
    //     .style('pointer-events', 'none')
    //     .style('fill', '#474747')
    //     .style('stroke', '#474747')
    //     .style('stroke-width', '1px');
    //   edgelabels = g
    //     .selectAll('.edgelabel')
    //     .data(links)
    //     .enter()
    //     .append('text')
    //     .style('pointer-events', 'none')
    //     .attr('class', 'edgelabel')
    //     .attr('id', function (d: any, i: any) {
    //       return 'edgelabel' + i;
    //     })
    //     .attr('font-size', 10);
    //   edgelabels
    //     .append('textPath')
    //     .attr('xlink:href', function (d: any, i: any) {
    //       return '#edgepath' + i;
    //     })
    //     .style('text-anchor', 'middle')
    //     .style('pointer-events', 'none')
    //     .attr('startOffset', '50%')
    //     .text(function (d: any) {
    //       return d.type;
    //     });
    //   node = g
    //     .selectAll('.node')
    //     .data(nodes)
    //     .enter()
    //     .append('g')
    //     .attr('class', 'node')
    //     .call(
    //       d3
    //         .drag()
    //         .on('start', dragstarted)
    //         .on('drag', dragged)
    //         .on('end', dragended),
    //     );
    //   node
    //     .append('circle')
    //     .attr('r', 5)
    //     .style('fill', function (d: any, i: any) {
    //       return d.name === 'Atom' ? '#9580FF' : '#FF80BF';
    //     });
    //   node.append('title').text(function (d: any) {
    //     return d.id;
    //   });
    //   node
    //     .append('text')
    //     .attr('dy', -3)
    //     .text(function (d: any) {
    //       return d.label;
    //     })
    //     .attr('fill', '#646464')
    //     .attr('stroke', 'none');
    //   simulation.nodes(nodes).on('tick', ticked);
    //   simulation.force('link').links(links);
    // }
    // function ticked() {
    //   link
    //     .attr('x1', function (d: any) {
    //       return d.source.x;
    //     })
    //     .attr('y1', function (d: any) {
    //       return d.source.y;
    //     })
    //     .attr('x2', function (d: any) {
    //       return d.target.x;
    //     })
    //     .attr('y2', function (d: any) {
    //       return d.target.y;
    //     });
    //   node.attr('transform', function (d: any) {
    //     return 'translate(' + d.x + ', ' + d.y + ')';
    //   });
    //   edgepaths.attr('d', function (d: any) {
    //     return (
    //       'M ' +
    //       d.source.x +
    //       ' ' +
    //       d.source.y +
    //       ' L ' +
    //       d.target.x +
    //       ' ' +
    //       d.target.y
    //     );
    //   });
    //   edgelabels.attr('transform', function (d: any) {
    //     if (d.target.x < d.source.x) {
    //       var bbox = this.getBBox();
    //       let rx = bbox.x + bbox.width / 2;
    //       let ry = bbox.y + bbox.height / 2;
    //       return 'rotate(180 ' + rx + ' ' + ry + ')';
    //     } else {
    //       return 'rotate(0)';
    //     }
    //   });
    // }
    // function dragstarted(d: any) {
    //   if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    //   d.fx = d.x;
    //   d.fy = d.y;
    // }
    // function dragged(d: any) {
    //   d.fx = d3.event.x;
    //   d.fy = d3.event.y;
    // }
    // function dragended(d: any) {
    //   if (!d3.event.active) simulation.alphaTarget(0);
    //   d.fx = undefined;
    //   d.fy = undefined;
    // }
    // // allows the canvas to be draggable
    // g.call(
    //   d3
    //     .drag()
    //     .on('start', dragStarted)
    //     .on('drag', draggedCanvas)
    //     .on('end', dragEnded),
    // );
    // // allows the canvas to be zoomable
    // svg.call(
    //   d3
    //     .zoom()
    //     .extent([
    //       [0, 0],
    //       [width, height],
    //     ])
    //     .scaleExtent([0, 8])
    //     .on('zoom', zoomed),
    // );
    // // helper functions that help with dragging functionality
    // function dragStarted() {
    //   d3.select(this).raise();
    //   g.attr('cursor', 'grabbing');
    // }
    // function draggedCanvas(d: any) {
    //   d3.select(this)
    //     .attr('dx', (d.x = d3.event.x))
    //     .attr('dy', (d.y = d3.event.y));
    // }
    // function dragEnded() {
    //   g.attr('cursor', 'grab');
    // }
    // // helper function that allows for zooming
    // function zoomed() {
    //   g.attr('transform', d3.event.transform);
    // }

    //Create Disjoint Force-Directed Graph

    const chart = (data: any) => {
      console.log('chart data', data);
      const links = data.links.map((d: any) => Object.create(d));
      const nodes = data.nodes.map((d: any) => Object.create(d));

      const color = () => {
        const scale = d3.scaleOrdinal(d3.schemeCategory10);
        return (d: any) => scale(d.group);
      };

      const simulation = d3
        .forceSimulation(nodes)
        .force(
          'link',
          d3.forceLink(links).id((d: any) => d.id),
        )
        .force('charge', d3.forceManyBody())
        .force('x', d3.forceX())
        .force('y', d3.forceY());

      const svg = d3
        // .create('svg')
        .select('#networkCanvas')
        .attr('viewBox', [-width / 2, -height / 2, width, height]);

      const link = svg
        .append('g')
        .attr('stroke', '#999')
        .attr('stroke-opacity', 0.6)
        .selectAll('line')
        .data(links)
        .join('line')
        .attr('stroke-width', (d: any) => Math.sqrt(d.value));

        console.log('link', link);

      const node = svg
        .append('g')
        .attr('stroke', '#fff')
        .attr('stroke-width', 1.5)
        .selectAll('circle')
        .data(nodes)
        .join('circle')
        .attr('r', 5)
        .attr('fill', color());
      // .call(drag(simulation));
      
      console.log('node', node);

      node.append('title').text((d: any) => d.label);

      simulation.on('tick', () => {
        link
          .attr('x1', (d: any) => d.source.x)
          .attr('y1', (d: any) => d.source.y)
          .attr('x2', (d: any) => d.target.x)
          .attr('y2', (d: any) => d.target.y);

        node.attr('cx', (d: any) => d.x).attr('cy', (d: any) => d.y);
      });

      // invalidation.then(() => simulation.stop());

      simulation.alpha(1).restart();

      // simulation.stop();

      return svg.node();
    };

    chart(networkData);
  }); //end of useEffect

  return (
    <div className="Network">
      <svg data-testid="networkCanvas" id="networkCanvas"></svg>
    </div>
  );
};

export default AtomNetworkVisual;