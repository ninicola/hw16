// @TODO: YOUR CODE HERE!

var svgWidth = 960;
var svgHeight = 500;

var margin = {
    top: 20,
    right: 40,
    bottom: 80,
    left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";

// function used for updating x-scale var upon click on axis label
function xScale(data, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(data, d => d[chosenXAxis]) * 0.8,
        d3.max(data, d => d[chosenXAxis]) * 1.2
        ])
        .range([0, width]);

    return xLinearScale;

}

// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis) {

    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]));

    return circlesGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup) {

    if (chosenXAxis === "poverty") {
        var label = "In Poverty (%):";
    }
    else if (chosenXAxis==="age"){
        var label = "Age (Median)";
    }
   else{
        var label ="Household Income (Median)"
   }
    var toolTip = d3.tip()
        .attr("class", "tooltip")
        .offset([80, -60])
        .html(function (d) {
            return (`${d.poverty}<br>${label} ${d[chosenXAxis]}`);
        });

    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", function (data) {
        toolTip.show(data);
    })
        // onmouseout event
        .on("mouseout", function (data, index) {
            toolTip.hide(data);
        });

    return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("/assets/data/data.csv", function (err, data) {
    if (err) throw err;
    var states = [];
    // parse data
    data.forEach(function (datap) {
        datap.poverty = +datap.poverty;
        datap.healthcare = +datap.healthcare;
        // datap.state= +datap.state;
        // states.push(datap.abbr);
        // states.push(datap.abbr);
    });
    // console.log(states);

    // xLinearScale function above csv import
    var xLinearScale = xScale(data, chosenXAxis);

    // Create y scale function
    var yLinearScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.healthcare)])
        .range([height, 0]);

    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // append x axis
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    // append y axis
    chartGroup.append("g")
        .call(leftAxis);

    // append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d.healthcare))
        .attr("r", 20)
        .attr("fill", "blue")
        .attr("opacity", ".5");



    // Appending a label to each data point
    chartGroup.append("text")
        .style("text-anchor", "middle")
        .style("font-size", "10px")
        .selectAll("tspan")
        .data(data)
        .enter()
        .append("tspan")
        .attr("x", function (d) {
            return xLinearScale(d[chosenXAxis]);
        })
        .attr("y", function (d) {
            return yLinearScale(d.healthcare);
        })
        .text(function (d) {
            return d.abbr
        });

  




    // Create group for  2 x- axis labels
    var labelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var povertyLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty") // value to grab for event listener
        .classed("active", true)
        .text("In Poverty (%)");

    // var albumsLabel = labelsGroup.append("text")
    //     .attr("x", 0)
    //     .attr("y", 40)
    //     .attr("value", "num_albums") // value to grab for event listener
    //     .classed("inactive", true)
    //     .text("# of Albums Released");

    // append y axis
    chartGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .classed("axis-text", true)
        .text("Lacks Healthcare (%)");

    // updateToolTip function above csv import
    var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

    // x axis labels event listener
    labelsGroup.selectAll("text")
        .on("click", function () {
            // get value of selection
            var value = d3.select(this).attr("value");
            if (value !== chosenXAxis) {

                // replaces chosenXAxis with value
                chosenXAxis = value;

                // console.log(chosenXAxis)

                // functions here found above csv import
                // updates x scale for new data
                xLinearScale = xScale(data, chosenXAxis);

                // updates x axis with transition
                xAxis = renderAxes(xLinearScale, xAxis);

                // updates circles with new x values
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

                // updates tooltips with new info
                circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

                // changes classes to change bold text
                // if (chosenXAxis === "num_albums") {
                //     povertyLabel
                //         .classed("active", false)
                //         .classed("inactive", true);
                //     // albumsLabel
                //     //     .classed("active", true)
                //     //     .classed("inactive", false);
                    
                // }
                // else {
                //     albumsLabel
                //         .classed("active", false)
                //         .classed("inactive", true);
                //     hairLengthLabel
                //         .classed("active", true)
                //         .classed("inactive", false);
                // }
            }
        });
});
