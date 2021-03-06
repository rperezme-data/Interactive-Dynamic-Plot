// CHART SETUP
// Pending: test window-size responsive
var svgWidth = 800;
var svgHeight = 600;

var margin = {
    top: 30,
    right: 20,
    bottom: 120,
    left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;


// SVG SETUP
// SVG wrapper
var svg = d3.select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

// SVG group
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Default parameters
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";


// UPDATE FUNCTIONS
// Update X-Scale (upon click on axis label)
function xScale(censusData, chosenXAxis) {
    // Create X-Scale
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(censusData, d => d[chosenXAxis]) * 0.9, d3.max(censusData, d => d[chosenXAxis]) * 1.1])
        .range([0, width]);
    return xLinearScale;
}

// Update Y-Scale (upon click on axis label)
function yScale(censusData, chosenYAxis) {
    // Create Y-Scale
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(censusData, d => d[chosenYAxis]) * 0.9, d3.max(censusData, d => d[chosenYAxis]) * 1.1])
        .range([height, 0]);   // Invert Y axis
    return yLinearScale;
}

// Update X-Axis (upon click on axis label)
function renderXAxes(newXScale, xAxis) {
    // Create X-Axis
    var bottomAxis = d3.axisBottom(newXScale);
    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);
    return xAxis;
}

// Update Y-Axis (upon click on axis label)
function renderYAxes(newYScale, yAxis) {
    // Create Y-Axis
    var leftAxis = d3.axisLeft(newYScale);
    yAxis.transition()
        .duration(1000)
        .call(leftAxis);
    return yAxis;
}

// Update Circles on X-Axis (upon click on axis label)
function renderXCircles(circlesGroup, newXScale, chosenXAxis) {
    // Set X-Transition
    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]));
    return circlesGroup;
}

// Update Circles on Y-Axis (upon click on axis label)
function renderYCircles(circlesGroup, newYScale, chosenYAxis) {
    // Set Y-Transition
    circlesGroup.transition()
        .duration(1000)
        .attr("cy", d => newYScale(d[chosenYAxis]));
    return circlesGroup;
}

// Update Text on X-Axis (upon click on axis label)
function renderXText(textGroup, newXScale, chosenXAxis) {
    // Set X-Transition
    textGroup.transition()
        .duration(1000)
        .attr("x", d => newXScale(d[chosenXAxis]));
    return textGroup;
}

// Update Text on Y-Axis (upon click on axis label)
function renderYText(textGroup, newYScale, chosenYAxis) {
    // Set Y-Transition
    textGroup.transition()
        .duration(1000)
        .attr("y", d => newYScale(d[chosenYAxis]));
    return textGroup;
}

// Update Tooltip Info (upon click on axis label)
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
    
    var xlabel;
    // Select appropiate x-Label
    if (chosenXAxis === "poverty") {xlabel = "Poverty: ";}
    else if (chosenXAxis === "age") {xlabel = "Age: ";}
    else {xlabel = "Income: $";}

    var ylabel;
    // Select appropiate y-Label
    if (chosenYAxis === "healthcare") {ylabel = "Lacks Healthcare: ";}
    else if (chosenYAxis === "smokes") {ylabel = "Smokes: ";}
    else {ylabel = "Obesity: ";}

    // Tooltip properties
    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([40, 90])
        .html(function (d) {
            // Select appropiate template
            if (chosenXAxis === "income") {
                return (`<strong style="color:#FF7A59">${d.state}</strong><br>${xlabel}${d[chosenXAxis].toLocaleString('en-US')}<br>${ylabel}${d[chosenYAxis]}%`);    
            } else if (chosenXAxis === "age") {
                return (`<strong style="color:#FF7A59">${d.state}</strong><br>${xlabel}${d[chosenXAxis]}<br>${ylabel}${d[chosenYAxis]}%`);
            } else {
                return (`<strong style="color:#FF7A59">${d.state}</strong><br>${xlabel}${d[chosenXAxis]}%<br>${ylabel}${d[chosenYAxis]}%`);
            }
        });

    // Call D3.Tooltip
    circlesGroup.call(toolTip);

    // Event listener (mouse-over)
    circlesGroup.on("mouseover", function (data) {
        toolTip.show(data)
    })
        // (mouse-out)
        .on("mouseout", function (data, index) {
            toolTip.hide(data);
        });

    return circlesGroup;
}


// LOAD DATA (INITIAL FUNCTION)
// Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/data.csv").then(function (censusData, err) {
    // Error handling
    if (err) throw err;

    // Parse data (types)
    censusData.forEach(function (data) {
        data.poverty = +data.poverty;
        data.age = +data.age;
        data.income = +data.income;
        data.healthcare = +data.healthcare;
        data.obesity = +data.obesity;
        data.smokes = +data.smokes;
    });

    // Create linear scales
    var xLinearScale = xScale(censusData, chosenXAxis);
    var yLinearScale = yScale(censusData, chosenYAxis);

    // Create initial axis
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Append X-axis
    var xAxis = chartGroup.append("g")
        // .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    // Append Y-axis
    var yAxis = chartGroup.append("g")
        .call(leftAxis);

    // Append initial circles
    var circlesGroup = chartGroup.append("g")
        .selectAll("circle")
        .data(censusData)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", 10)
        .classed("stateCircle", true)
        .classed("inactive-circle", true);

    // Append initial text
    var textGroup = chartGroup.append("g")
        .selectAll("text")
        .data(censusData)
        .enter()
        .append("text")
        .attr("x", (d) => xLinearScale(d[chosenXAxis]))
        .attr("y", (d) => yLinearScale(d[chosenYAxis]))
        .attr("dy", "0.35em")
        .classed("stateText", true)
        .text((d) => d.abbr);

    // Create group for X-axis labels
    var labelsXGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var povertyLabel = labelsXGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty") // Value to grab for event listener
        .classed("active", true)
        .text("In Poverty (%)");

    var ageLabel = labelsXGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age") // Value to grab for event listener
        .classed("inactive", true)
        .text("Age (Median)");

    var incomeLabel = labelsXGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income") // Value to grab for event listener
        .classed("inactive", true)
        .text("Household Income (Median)");

    // Create group for Y-axis labels
    var labelsYGroup = chartGroup.append("g")
        .attr("transform", `translate(${-20}, ${height / 2})`);

    var obesityLabel = labelsYGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", 0)
        .attr("y", -60)
        .attr("value", "obesity") // Value to grab for event listener
        .classed("inactive", true)
        .text("Obese (%)");

    var smokesLabel = labelsYGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", 0)
        .attr("y", -40)
        .attr("value", "smokes") // Value to grab for event listener
        .classed("inactive", true)
        .text("Smokes (%)");

    var healthcareLabel = labelsYGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", 0)
        .attr("y", -20)
        .attr("value", "healthcare") // Value to grab for event listener
        .classed("active", true)
        .text("Lacks Healthcare (%)");

    // Update tooltip
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    // X-axis labels event listener
    labelsXGroup.selectAll("text").on("click", function () {
  
            // Get value of selection
            var value = d3.select(this).attr("value");
  
            if (value !== chosenXAxis) {

                // Replace chosenXAxis with value
                chosenXAxis = value;

                // Update X-scale for new data
                xLinearScale = xScale(censusData, chosenXAxis);

                // Update X-axis with transition
                xAxis = renderXAxes(xLinearScale, xAxis);

                // Updates circles & text with new X-values
                circlesGroup = renderXCircles(circlesGroup, xLinearScale, chosenXAxis);
                textGroup = renderXText(textGroup, xLinearScale, chosenXAxis);

                // Update tooltip with new info
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

                // Changes classes to change bold text
                if (chosenXAxis === "poverty") {
                    povertyLabel.classed("active", true).classed("inactive", false);
                    ageLabel.classed("active", false).classed("inactive", true);
                    incomeLabel.classed("active", false).classed("inactive", true);

                } else if (chosenXAxis === "age") {
                    povertyLabel.classed("active", false).classed("inactive", true);
                    ageLabel.classed("active", true).classed("inactive", false);
                    incomeLabel.classed("active", false).classed("inactive", true);

                } else {
                    povertyLabel.classed("active", false).classed("inactive", true);
                    ageLabel.classed("active", false).classed("inactive", true);
                    incomeLabel.classed("active", true).classed("inactive", false);

                }
            }
        });

    // Y-axis labels event listener
    labelsYGroup.selectAll("text").on("click", function () {

            // Get value of selection
            var value = d3.select(this).attr("value");
        
            if (value !== chosenYAxis) {

                // Replace chosenYAxis with value
                chosenYAxis = value;

                // Update Y-scale for new data
                yLinearScale = yScale(censusData, chosenYAxis);

                // Update Y-axis with transition
                yAxis = renderYAxes(yLinearScale, yAxis);

                // Update circles & text with new Y-values
                circlesGroup = renderYCircles(circlesGroup, yLinearScale, chosenYAxis);
                textGroup = renderYText(textGroup, yLinearScale, chosenYAxis);

                // Update tooltip with new info
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

                // Changes classes to change bold text
                if (chosenYAxis === "obesity") {
                    obesityLabel.classed("active", true).classed("inactive", false);
                    smokesLabel.classed("active", false).classed("inactive", true);
                    healthcareLabel.classed("active", false).classed("inactive", true);

                } else if (chosenYAxis === "smokes") {
                    obesityLabel.classed("active", false).classed("inactive", true);
                    smokesLabel.classed("active", true).classed("inactive", false);
                    healthcareLabel.classed("active", false).classed("inactive", true);

                } else {
                    obesityLabel.classed("active", false).classed("inactive", true);
                    smokesLabel.classed("active", false).classed("inactive", true);
                    healthcareLabel.classed("active", true).classed("inactive", false);

                }
            }
        });

}).catch(function (error) {
    console.log(error);
});
