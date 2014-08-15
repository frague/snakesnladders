var g, way, paper = Raphael("desk"), cells = {}, taken = {}, size = 40, infinity = 999;

var graph = function() {
    this.nodes = {};
    this.visited = 0;

    this.get_node = function(n) {
        return this.nodes["n" + n];
    }

    this.add_node = function(id, way) {
        this.nodes["n" + id] = new node(id, way);
    }
}

var node = function(id, way) {
    this.id = id;
    this.rels = [];
    this.way = typeof way != 'undefined' ? way : infinity;
    this.visited = false;
}

node.prototype.add_rel = function(t, w) {
    var r = new rel(t, w);
    this.rels.push(r);
}

var rel = function(t, w) {
    this.to = 1 * t;
    this.weight = w;
}

var arrow = {
    al: 10, 
    aw: 8, 
    make_path: function(x1, y1, len, angle) {
        path = "M" + x1 + "," + y1 + "V" + (y1 + len) + "M" + (x1 + this.aw) + "," + (y1 + len - this.al) + "L" + x1 + "," + (y1 + len) + "L" + (x1 - this.aw) + "," + (y1 + len - this.al);
        paper.path(path)
            .attr("stroke-width", 3)
            .attr("stroke", "#FF0000")
            .rotate(90 + angle, x1, y1)
    }
}

var ladder = {
    lw: 20, 
    sh: 10,
    make_path: function(x1, y1, len, angle) {
        x1 -= this.lw / 2;
        path = "M" + x1 + "," + y1 + "V" + (y1 + len) + "M" + (x1 + this.lw) + "," + (y1 + len) + "V" + y1;
        for (var i = 0, s = len / this.sh; i < s; i++) {
            path += "V" + (y1 + i * this.sh) + "H" + (i % 2 ? x1 : x1 + this.lw);
        }
        paper.path(path)
            .attr("stroke-width", 3)
            .attr("stroke", "#805700")
            .rotate(90 + angle, x1 + this.lw / 2, y1)
    }
}

var snake = {
    sw: 12, 
    cl: 40,
    cr: 10,
    make_path: function(x1, y1, len, angle) {
        cx = x1;
        cy = y1;
        x1 -= this.sw / 2;
        y1 += 20;
        len -= 20;
        path = "M" + x1 + "," + y1;
        back_path = "";
        var i = 0, s = Math.ceil(len / this.cl) - 1;
        var d = len - s * this.cl;
        if (d < 10) {
            s -= 1;
            d += this.cl;
        }

        hx = x1 + this.sw;
        hy = y1;
        // Body
        for (; i < s; i++) {
            path += "C" + x1 + "," + y1 + "," + (x1 + (i % 2 ? this.cr : -this.cr)) + "," + (y1 + this.cl / 2) + "," + x1 + "," + (y1 + this.cl);
            back_path = "C"+ (x1 + this.sw) + "," + (y1 + this.cl) + "," + (x1 + this.sw + (i % 2 ? this.cr : -this.cr)) + "," + (y1 + this.cl / 2) + "," + (x1 + this.sw) + "," + y1 + back_path;
            y1 += this.cl;
        }
        path += "C" + x1 + "," + y1 + "," + (x1 + (i % 2 ? this.cr : -this.cr) / 2) + "," + (y1 + d / 2) + "," + (x1 + this.sw / 2 ) + "," + (y1 + d);
        path += "C" + (x1 + this.sw / 2 ) + "," + (y1 + d) + "," + (x1 + this.sw / 2 + (i % 2 ? this.cr : -this.cr) / 2) + "," + (y1 + d / 2) + "," + (x1 + this.sw) + "," + y1;
        path += back_path;

        // Head
        path += "C" + hx + "," + hy + "," + (hx + 4) + "," + (hy - 4) + "," + hx + "," + (hy - 20);
        path += "C" + hx + "," + (hy - 20) + "," + (hx - this.sw / 2) + "," + (hy - 30) + "," + (hx - this.sw) + "," + (hy - 20);
        path += "C" + (hx - this.sw) + "," + (hy - 20) + "," + (hx - 4 - this.sw) + "," + (hy - 4) + "," + (hx - this.sw) + "," + hy;

        // Eyes
        hy -= 10;
        path += "M" + (hx - 4) + "," + hy + "L" + (hx - 2) + "," + (hy + 2);
        path += "M" + (hx + 4 - this.sw) + "," + hy + "L" + (hx + 2 - this.sw) + "," + (hy + 2);

        paper.path(path)
            .attr("stroke-width", 3)
            .attr("stroke", "#5D7F00")
            .attr("fill", "#75A61A")
            .rotate(90 + angle, cx, cy)
    }
}

function quick_rel(f, t, o) {
    var fr = cells["c" + f], to = cells["c" + t];
    var x1 = fr.attr("x"), y1 = fr.attr("y");
    var x2 = to.attr("x"), y2 = to.attr("y");
    var dx = x2 - x1, dy = y2 - y1, len = Math.round(Math.sqrt( dx*dx + dy*dy)), angle = Raphael.angle(x1, y1, x2, y2)
    x1 += (size - 4) / 2;
    y1 += (size - 4) / 2;

    o.make_path(x1, y1, len, angle);
}

function redraw_board() {
    paper.clear();
    var i = 1
    cells = {}

    for (var y = 9; y >= 0; y--)
        for (var x = 0; x < 10; x++) {
            var xx = (y % 2 ? x : 9 - x) * size;
            cells["c" + i] = paper.rect(xx + 4, 4 + y * size, size - 4, size - 4, 0)
                .attr("fill", "#EEE")
                .attr("stroke", "#AAA");
            paper.text(xx + 14., 10 + y * size, i)
                .attr("fill", "#888");
            g.add_node(i, i == 1 ? 0: infinity);
            i += 1;
        }
}

function draw_shortcuts(l, s) {
    for (var t = 0; t < 2; t++) {
        var source = [l, s][t].split(" ");
        for (var i = 0, l = source.length; i < l; i++) {
            
            var nodes = source[i].split(",");
            quick_rel(nodes[0], nodes[1], t ? snake : ladder);
            taken["c" + nodes[0]] = t ? 100 : 0.01;
            g.get_node(nodes[0]).add_rel(nodes[1], 0);
        }
    }
}

function create_links() {
    for (var i = 1; i <= 100; i++) {
        var n = g.get_node(i), t;
        // If snake or ladder starts in this cell no other links can exist here
        if (typeof taken["c" + i] == 'number') continue;
        for (j = 1; j <= 6; j++) {
            if (i + j > 100) break;
            t = taken["c" + (i + j)];
            n.add_rel(i + j, (7 - j) * (typeof t == 'number' ? t : 1));
        }
    }
}

function dijkstra(n) {
    var next, shortest = infinity;
    for (var i in n.rels) {
        var r = n.rels[i], n1 = g.get_node(r.to);
        if (n1.visited) continue;

        n1.way = n.way + r.weight;
        if (n1.way < shortest) {
            next = n1;
            shortest = n1.way;
        }
    }

    n.visited = true;
    g.visited++;
    if (next) {
        quick_rel(n.id, next.id, arrow);
        way.push(n);
    } else {
        for (var i in g.nodes) {
            var n = g.nodes[i];
            if (n.visited) continue;
            if (n.way < shortest) next = n;
        }
    }
    if (g.visited < g.nodes.length || next.id != 100) dijkstra(next);
}

/*for (var i = 0; i < 5; i++) {
    var f = 1 + Math.round(50 * Math.random()), t = 50 + Math.round(50 * Math.random());
    if (i % 2) quick_rel(f, t,  ladder); else quick_rel(t, f,  snake);
}*/

function solve() {
    var input = document.getElementById("input").value.split("\n")
    g = new graph(), way = [], taken = {};
    redraw_board();
    draw_shortcuts(input[1], input[2]);
    create_links();

    dijkstra(g.get_node(1));
    console.log(g, way);
}