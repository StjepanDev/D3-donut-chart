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

//update function

const update = (data) => {
  //join enhanced pie data to the path elements

  const paths = graph.selectAll('path').data(pie(data));

  console.log(paths.enter());

  paths
    .enter()
    .append('path')
    .attr('class', 'arc')
    .attr('d', arcPath)
    .attr('stroke', 'white')
    .attr('stroke-width', 3);
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
