///<reference path="Scripts/d3.d.ts" />
///<reference path="Scripts/jquery-1.8.3.d.ts" />
///<reference path="interpreter.ts" />

module UI {

    function children(n: Interpreter.Tree) {
        var ret = [];
        if (n.left)
            ret.push(n.left);
        if (n.right)
            ret.push(n.right);
        return ret;
    }

    function translate(x, y) {
        return 'translate(' + x + ',' + y + ')';
    }

    export function drawTree(d3container: JQuery, tree: Interpreter.Tree) {

        var w = d3container.width();
        var h = d3container.height();

        var gap = 7;
        var gap2 = gap * 2;

        var svg = d3.select(d3container[0]).append('svg')
            .attr('width', w)
            .attr('height', h);

        var vis = svg.append('g')
            .attr('transform', translate(gap, gap));

        var treeLayout = d3.layout.tree()
            .children(children)
            .size([w-gap2, h-gap2]);

        var visData = { gap: gap, treeLayout: treeLayout, svg: svg, vis: vis, lastTree: undefined };

        return updateTree(visData, tree);
    }

    export function resizeTreeBox(visData, w, h) {
        var gap = visData.gap;
        
        visData.treeLayout = d3.layout.tree()
            .children(children)
            .size([w-gap*2, h-gap*2]);

        visData.svg
            .attr('width', w)
            .attr('height', h);

        return updateTree(visData, visData.lastTree);
    }

    export function updateTree(visData, tree: Interpreter.Tree) {
        var treeLayout = visData.treeLayout;
        var vis = visData.vis;
        var duration = 500;

        var diagonal = d3.svg.diagonal();
        var nodes = treeLayout.nodes(tree);       
        
        // very important
        tree.annotateIds();

        var node = vis.selectAll('g.node')
            .data(nodes, d => d.id);

        var nodeEnter = node.enter().append('g')
            .attr('class', 'node')
            .attr('transform', d => translate(d.x, d.y))
            .style('opacity', 0);

        nodeEnter.append('circle')
            .attr('r', 5)
            .style('fill', '#000');

        var nodeUpdate = node.transition()
            .duration(duration)
            .attr('transform', d => translate(d.x, d.y))
            .style('opacity', 1);

        var nodeExit = node.exit().remove();
        
        var link = vis.selectAll('path.link')
            .data(treeLayout.links(nodes), d => d.source.id + '_' + d.target.id);
        
        var linkEnter = link.enter().insert('path', 'g')
            .attr('class', 'link')
            .attr('d', diagonal)
            .style('opacity', 0);

        var linkUpate = link.transition()
            .duration(duration)
            .attr('d', diagonal)
            .style('opacity', 1);

        var linkExit = link.exit().remove();

        visData.lastTree = tree;
        return visData;
    }
}