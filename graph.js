const dimensions = { height: 300, width: 300, radius: 150 };
const center = { x: dimensions.width / 2 + 5, y: dimensions.height / 2 + 5 };

const svg = d3
  .select('.canvas')
  .append('svg')
  .attr('width', dimensions.width + 150)
  .attr('height', dimensions.width + 150);

const graph = svg
  .append('g')
  .attr('transform', `translate(${center.x}, ${center.y})`);

//creates angles for slices in chart
const pie = d3
  .pie()
  .sort(null) //to not sort data by values-sizes
  .value((d) => d.trosak); //returns angles for each slice

const arcPath = d3
  .arc()
  .outerRadius(dimensions.radius) // draws  pie
  .innerRadius(dimensions.radius / 2); //makes donut hole

const color = d3.scaleOrdinal(d3['schemeSet1']);

//legend setup

const legendGroup = svg
  .append('g')
  .attr('transform', `translate(${dimensions.width + 60}, 10)`);

const legend = d3.legendColor().shape('circle').shapePadding(10).scale(color);

//tooltip lib setup
const tip = d3
  .tip()
  .attr('class', 'tip card')
  .html((d) => {
    let content = `<div class="name">${d.data.name.toUpperCase()}</div>`;
    content += `<div class="cost">${d.data.trosak} $</div>`;
    content += `<div class="delete">Obrisi Klikom</div>`;
    return content;
  });

graph.call(tip);

//update function
const update = (data) => {
  //update color scale domain
  color.domain(data.map((d) => d.name));

  //update and call color legend

  legendGroup.call(legend);
  legendGroup.selectAll('text').attr('fill', 'white');

  //join enhanced pie data to the path elements
  const paths = graph.selectAll('path').data(pie(data));

  //handle exit selection elements from dom
  paths.exit().transition().duration(800).attrTween('d', arcTweenExit).remove();

  //handle current dom path updates

  paths
    .attr('d', arcPath)
    .transition()
    .duration(800)
    .attrTween('d', arcTweenUpdate);

  // console.log(paths.enter());

  paths
    .enter()
    .append('path')
    .attr('class', 'arc')
    .attr('d', arcPath) //not needed anymore starting position
    .attr('stroke', 'white')
    .attr('stroke-width', 3)
    .attr('fill', (d) => color(d.data.name))
    .each(function (d) {
      this._current = d;
    })
    .transition()
    .duration(800)
    .attrTween('d', arcTweenEnter); //because we update here with tweeen over 800 ms

  //add event listeners
  graph
    .selectAll('path')
    .on('mouseover', (d, i, n) => {
      tip.show(d, n[i]); //  function 2

      handleMouseOver(d, i, n); //  function 1
    })
    .on('mouseout', (d, i, n) => {
      tip.hide();
      handleMouseOut(d, i, n);
    })
    .on('click', handleClick);
};
//data array from firestore data
let data = [];

db.collection('troskovi').onSnapshot((res) => {
  res.docChanges().forEach((change) => {
    const doc = { ...change.doc.data(), id: change.doc.id };

    switch (change.type) {
      case 'added':
        data.push(doc);
        break;
      case 'modified':
        const index = data.findIndex((item) => item.id === doc.id);
        data[index] = doc;
        break;
      case 'removed':
        data = data.filter((item) => item.id !== doc.id);
        break;
      default:
        break;
    }
  });

  update(data);
});

const arcTweenEnter = (d) => {
  let i = d3.interpolate(d.endAngle, d.startAngle);

  return function (t) {
    d.startAngle = i(t);
    return arcPath(d);
  };
};
const arcTweenExit = (d) => {
  let i = d3.interpolate(d.startAngle, d.endAngle);

  return function (t) {
    d.startAngle = i(t);
    return arcPath(d);
  };
};

// not!! arrow function because  usage of this

function arcTweenUpdate(d) {
  // interpolate between 2 arc objects
  console.log(this._current, d);

  let i = d3.interpolate(this._current, d);

  // update the current  prop with new updated angles
  this._current = i(d);

  return function (t) {
    return arcPath(i(t));
  };
}

// hover handler
const handleMouseOver = (d, i, n) => {
  d3.select(n[i])
    .transition('hoverSliceFill')
    .duration(300)
    .attr('fill', '#fff');
};

// un hover handler
const handleMouseOut = (d, i, n) => {
  d3.select(n[i])
    .transition('hoverSliceFill')
    .duration(300)
    .attr('fill', color(d.data.name));
};

const handleClick = (d) => {
  const id = d.data.id;

  db.collection('troskovi').doc(id).delete();
};
