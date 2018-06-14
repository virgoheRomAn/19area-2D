let Brando = function() {
	this.version = 0.1;
	this.Global = {
			EVENT_POINT : 0,
			EVENT_END   : 1,
			EVENT_START : 2,
	}
	
	this.Global.EPSILON = 1.1102230246251565e-16;
	this.Global.ERRBOUND3 = (3.0 + 16.0 * this.Global.EPSILON) * this.Global.EPSILON;
	this.Global.ERRBOUND4 = (7.0 + 56.0 * this.Global.EPSILON) * this.Global.EPSILON;
}

export let  newBrando = new Brando();

 newBrando.Event = function(a, b, type, idx) {
	this.a = a;
	this.b = b;
	this.type = type,
	this.idx = idx;
}
newBrando.FaceIndex = function (cells, neighbor, constraint, flags, active, next, boundary) {
	this.cells = cells;
	this.neighbor = neighbor;
	this.flags = flags;
	this.constraint = constraint;
	this.active = active;
	this.next = next;
	this.boundary = boundary;
}
newBrando.FaceIndex.prototype = {
	locate : (function() {
		var key = [0,0,0];
		return function(a, b, c) {
		    var x = a, y = b, z = c
		    if(b < c) {
		      if(b < a) {
		        x = b
		        y = c
		        z = a
		      }
		    } else if(c < a) {
		      x = c
		      y = a
		      z = b
		    }
		    if(x < 0) {
		      return -1
		    }
		    key[0] = x;
		    key[1] = y;
		    key[2] = z;
		    return eq(this.cells, key, compareCell);
		}
	})(),
}
newBrando.PartialHull = function(a, b, idx, lowerIds, upperIds) {
	this.a = a
	this.b = b
	this.idx = idx
	this.lowerIds = lowerIds
	this.upperIds = upperIds
}
newBrando.Triangle = function(a, b, c) {
	this.a = a;
	this.b = b;
	this.c = c;
}
newBrando.Triangulation = function (stars, edges) {
	this.stars = stars
	this.edges = edges
}
newBrando.Triangulation.prototype = {
	addTriangle : function(i, j, k) {
		var stars = this.stars
		stars[i].push(j, k);
		stars[j].push(k, i);
		stars[k].push(i, j);
	
	},
	cells : function() {
		var stars = this.stars
		var result = []
		for(var i=0, n=stars.length; i<n; ++i) {
			var list = stars[i]
		    for(var j=0, m=list.length; j<m; j+=2) {
		    	var s = list[j]
		    	var t = list[j+1]
		    	if(i < Math.min(s, t)) {
		    		result.push([i, s, t])
		    	}
	    	}
		}
		return result
	},
	opposite : function(j, i) {
		var list = this.stars[i];
		for(var k=1, n=list.length; k<n; k+=2) {
		    if(list[k] === j) {
		    	return list[k-1];
		    }
		}
		return -1;
	},
	isConstraint : (function() {
		  var e = [0,0]
		  function compareLex(a, b) {
			  var temp = a[0] - b[0] || a[1] - b[1]; 
		    return temp;
		  }
		  return function(i, j) {
		    e[0] = Math.min(i,j);
		    e[1] = Math.max(i,j);
		    var te = eq(this.edges, e, compareLex) >= 0; 
		    return te;
		  }
	})(),
}

export const  triangulateMain = function(points, edges) {
	var cells = monotoneTriangulate(points, edges);
	var triangulation = createTriangulation(points.length, canonicalizeEdges(edges));
	for(var i=0; i<cells.length; ++i) {
		var f = cells[i];
		triangulation.addTriangle(f[0], f[1], f[2]);
	}
	
	cells = filterTriangulation(triangulation, -1);
	return cells;
}

export  function addPoint(cells, hulls, points, p, idx) {
	var lo = lt(hulls, p, testPoint);
	var hi = gt(hulls, p, testPoint);
	for(var i=lo; i<hi; ++i) {
		var hull = hulls[i];
	    var lowerIds = hull.lowerIds;
	    var m = lowerIds.length;
	    while(m > 1 && orientation3(points[lowerIds[m-2]], points[lowerIds[m-1]], p) > 0) {
	    	cells.push([lowerIds[m-1], lowerIds[m-2], idx]);
	    	m -= 1;
	    }
	    lowerIds.length = m;
	    lowerIds.push(idx);
	    var upperIds = hull.upperIds;
	    var m = upperIds.length;
	    while(m > 1 && orientation3(points[upperIds[m-2]], points[upperIds[m-1]], p) < 0) {
	    	cells.push([upperIds[m-2], upperIds[m-1], idx]);
	    	m -= 1;
	    }
	    upperIds.length = m;
	    upperIds.push(idx);
	}
}

export  function splitHulls(hulls, points, event) {
	var splitIdx = le(hulls, event, findSplit);
	var hull = hulls[splitIdx];
	var upperIds = hull.upperIds;
	var x = upperIds[upperIds.length-1];
	hull.upperIds = [x];
	hulls.splice(splitIdx+1, 0, new newBrando.PartialHull(event.a, event.b, event.idx, [x], upperIds));
}

export  function findSplit(hull, edge) {
	var d;
	if(hull.a[0] < edge.a[0]) {
	    d = orientation3(hull.a, hull.b, edge.a);
	} else {
	    d = orientation3(edge.b, edge.a, hull.a);
	}
	if(d) { return d }
	if(edge.b[0] < hull.b[0]) {
		d = orientation3(hull.a, hull.b, edge.b);
	} else {
		d = orientation3(edge.b, edge.a, hull.b);
	}
	return d || hull.idx - edge.idx;
}

export  function mergeHulls(hulls, points, event) {
	var tmp = event.a;
	event.a = event.b;
	event.b = tmp;
	var mergeIdx = eq(hulls, event, findSplit);
	var upper = hulls[mergeIdx];
	var lower = hulls[mergeIdx-1];
	lower.upperIds = upper.upperIds;
	hulls.splice(mergeIdx, 1);
}

function monotoneTriangulate(points, edges) {
	var numPoints = points.length;
	var numEdges = edges.length;
	var events = [];
	for(var i=0; i<numPoints; ++i) {
		events.push(new newBrando.Event(points[i], null, newBrando.Global.EVENT_POINT, i));
	}
	for(var i=0; i<numEdges; ++i) {
	    var e = edges[i];
	    var a = points[e[0]];
	    var b = points[e[1]];
	    if(a[0] < b[0]) {
	    	events.push(new newBrando.Event(a, b, newBrando.Global.EVENT_START, i), new newBrando.Event(b, a, newBrando.Global.EVENT_END, i));
	    } else if(a[0] > b[0]) {
	    	events.push(new newBrando.Event(b, a, newBrando.Global.EVENT_START, i), new newBrando.Event(a, b, newBrando.Global.EVENT_END, i));
	    }
	}
	events.sort(compareEvent);
	var minX = events[0].a[0] - (1 + Math.abs(events[0].a[0])) * Math.pow(2, -52)
	var hull = [ new newBrando.PartialHull([minX, 1], [minX, 0], -1, [], [], [], []) ]
	var cells = []
	for(var i=0, numEvents=events.length; i<numEvents; ++i) {
		var event = events[i]
		var type = event.type
		if(type === newBrando.Global.EVENT_POINT) {
			addPoint(cells, hull, points, event.a, event.idx)
		} else if(type === newBrando.Global.EVENT_START) {
			splitHulls(hull, points, event);
		} else {
			mergeHulls(hull, points, event);
		}
	}
	return cells;
}

export function testPoint(hull, p) {
	return orientation3(hull.a, hull.b, p);
}

export function orientation3(a, b, c) {
	var l = (a[1] - c[1]) * (b[0] - c[0]);
    var r = (a[0] - c[0]) * (b[1] - c[1]);
    var det = l - r;
    var s;
    if(l > 0) {
      if(r <= 0) {
        return det;
      } else {
        s = l + r;
      }
    } else if(l < 0) {
      if(r >= 0) {
        return det;
      } else {
        s = -(l + r);
      }
    } else {
      return det;
    }
    var tol = newBrando.Global.ERRBOUND3 * s;
    if(det >= tol || det <= -tol) {
      return det;
    }
    return orientation3Exact(a, b, c);
}

export  function indexCells(triangulation, infinity) {
		var cells = triangulation.cells();
		var nc = cells.length;
	  for(var i=0; i<nc; ++i) {
	    var c = cells[i];
	    var x = c[0], y = c[1], z = c[2];
	    if(y < z) {
	      if(y < x) {
	        c[0] = y;
	        c[1] = z;
	        c[2] = x;
	      }
	    } else if(z < x) {
	      c[0] = z;
	      c[1] = x;
	      c[2] = y;
	    }
		}
		cells.sort(compareCell);
		var flags = new Array(nc);
	  for(var i=0; i<flags.length; ++i) {
	    flags[i] = 0;
	  }
	  var active = [];
	  var next   = [];
	  var neighbor = new Array(3*nc);
		var constraint = new Array(3*nc);
	  var boundary = null;
	  if(infinity) {
	    boundary = [];
	  }
	  var index = new newBrando.FaceIndex(cells, neighbor, constraint, flags, active, next, boundary);
	  for(var i=0; i<nc; ++i) {
	    var c = cells[i];
	    for(var j=0; j<3; ++j) {
	      var x = c[j], y = c[(j+1)%3];
	      var a = neighbor[3*i+j] = index.locate(y, x, triangulation.opposite(y, x));
	      var b = constraint[3*i+j] = triangulation.isConstraint(x, y);
	      if(a < 0) {
	        if(b) {
	          next.push(i);
	        } else {
	          active.push(i);
	          flags[i] = 1;
	        }
	        if(infinity) {
	          boundary.push([y, x, -1]);
	        }
	      }
	    }
	  }
	return index;
}

export  function filterTriangulation(triangulation, target, infinity) {
	var index = indexCells(triangulation, infinity)
	if(target === 0) {
	    if(infinity) {
	    	return index.cells.concat(index.boundary)
	    } else {
	    	return index.cells
	    }
	}
	var side = 1
	var active = index.active
	var next = index.next
	var flags = index.flags
	var cells = index.cells
	var constraint = index.constraint
	var neighbor = index.neighbor
	while(active.length > 0 || next.length > 0) {
	    while(active.length > 0) {
	      var t = active.pop()
	      if(flags[t] === -side) {
	        continue
	      }
	      flags[t] = side
	      var c = cells[t]
	      for(var j=0; j<3; ++j) {
	        var f = neighbor[3*t+j]
	        if(f >= 0 && flags[f] === 0) {
	          if(constraint[3*t+j]) {
	            next.push(f)
	          } else {
	            active.push(f)
	            flags[f] = side
	          }
	        }
	      }
	    }
	    var tmp = next
	    next = active
	    active = tmp
	    next.length = 0
	    side = -side
	}
	var result = filterCells(cells, flags, target)
	if(infinity) {
		return result.concat(index.boundary);
	}
	return result;
}

export  function filterCells(cells, flags, target) {
  var ptr = 0
  for(var i=0; i<cells.length; ++i) {
    if(flags[i] === target) {
      cells[ptr++] = cells[i]
    }
  }
  cells.length = ptr
  return cells
}

export  function canonicalizeEdge(e) {
	return [Math.min(e[0], e[1]), Math.max(e[0], e[1])];
}
export  function compareEdge(a, b) {
	return a[0]-b[0] || a[1]-b[1];
}
export  function canonicalizeEdges(edges) {
	return edges.map(canonicalizeEdge).sort(compareEdge);
}
export  function createTriangulation(numVerts, edges) {
	let stars = new Array(numVerts);
	for(var i=0; i<numVerts; ++i) {
		stars[i] = [];
	}
	return new newBrando.Triangulation(stars, edges);
}
export  function compareEvent(a, b) {
	var d = (a.a[0] - b.a[0]) || (a.a[1] - b.a[1]) || (a.type - b.type);
	if(d) { 
		return d;
	}
	if(a.type !== newBrando.Global.EVENT_POINT) {
		d = orientation3(a.a, a.b, b.b);
		if(d) { 
			return d; 
		}
	}
	return a.idx - b.idx;
}
export  function compareCell(a, b) {
	return a[0] - b[0] || a[1] - b[1] || a[2] - b[2];
}
export  function lt(a,y,c,l,h) {
	var A = function (a,l,h,y){
		var i=l-1;
		while(l<=h){
			var m=(l+h)>>>1,x=a[m];
			if(x<y){
				i=m;
				l=m+1;
			}else{
				h=m-1;
			}
		}
		return i;
	};
	var P = function (a,l,h,y,c){
		var i=l-1;
		while(l<=h){
			var m=(l+h)>>>1,x=a[m];
			if(c(x,y)<0){
				i=m;
				l=m+1;
			}else{
				h=m-1;
			}
		}
		return i;
	};
	if(typeof(c)==='function'){
		return P(a,(l===void 0)?0:l|0,(h===void 0)?a.length-1:h|0,y,c);
	}else{
		return A(a,(c===void 0)?0:c|0,(l===void 0)?a.length-1:l|0,y);
	}
}
export  function gt(a,y,c,l,h) {
	var A = function (a,l,h,y){
		var i=h+1;
		while(l<=h){
			var m=(l+h)>>>1,x=a[m];
			if(x>y){
				i=m;
				h=m-1;
			}else{
				l=m+1;
			}
		}
		return i;
	};
	var P = function (a,l,h,y,c) {
		var i=h+1;
		while(l<=h){
			var m=(l+h)>>>1,x=a[m];
			if(c(x,y)>0){
				i=m;
				h=m-1;
			}else{
				l=m+1;
			}
		}
		return i;
	};
	if(typeof(c)==='function'){
		return P(a,(l===void 0)?0:l|0,(h===void 0)?a.length-1:h|0,y,c);
	}else{
		return A(a,(c===void 0)?0:c|0,(l===void 0)?a.length-1:l|0,y);
	}
}
export  function le(a,y,c,l,h) {
	function A(a,l,h,y){
		var i=l-1;
		while(l<=h){
			var m=(l+h)>>>1,x=a[m];
			if(x<=y){
				i=m;
				l=m+1
			}else{
				h=m-1;
			}
		}
		return i;
	};
	function P(a,l,h,y,c){
		var i=l-1;
		while(l<=h){
			var m=(l+h)>>>1,x=a[m];
			if(c(x,y)<=0){
				i=m;
				l=m+1;
			}else{
				h=m-1;
			}
		}
		return i;
	};
	if(typeof(c)==='function'){
		return P(a,(l===void 0)?0:l|0,(h===void 0)?a.length-1:h|0,y,c);
	}else{
		return A(a,(c===void 0)?0:c|0,(l===void 0)?a.length-1:l|0,y);
	}
}
export function eq(a,y,c,l,h) {
	var A = function (a,l,h,y){
		l-1;
		while(l<=h){
			var m=(l+h)>>>1,x=a[m];
			if(x===y){
				return m;
			}else if(x<=y){
				l=m+1;
			}else{
				h=m-1;
			}
		}
		return -1;
	};
	var P = function (a,l,h,y,c){
		l-1;
		while(l<=h){
			var m=(l+h)>>>1,x=a[m];
			var p=c(x,y);
			if(p===0){
				return m
			}else if(p<=0){
				l=m+1;
			}else{
				h=m-1;
			}
		}
		return -1;
	};
	if(typeof(c)==='function'){
		return P(a,(l===void 0)?0:l|0,(h===void 0)?a.length-1:h|0,y,c);
	}else{
		return A(a,(c===void 0)?0:c|0,(l===void 0)?a.length-1:l|0,y);
	}
}
export default{
	triangulateMain
}



