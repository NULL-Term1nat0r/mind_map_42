// MindMapService.js
const MindMapService = {
    selectedShape: null, // Store the selected shape
    circleRadius: 20, // Default radius for circle
    circleColor: '#FF0000', // Default color for circle
    isDrawingLine: false, // Track if drawing a line
    lineStartCircle: null, // Store the starting circle for the line
    lineEndCircle: null, // Store the ending circle for the line

    // Set the selected shape
    setSelectedShape: function (shape) {
        this.selectedShape = shape;
        this.isDrawingLine = shape === 'line'; // Enable line drawing mode if line is selected
    },

    // Get the selected shape
    getSelectedShape: function () {
        return this.selectedShape;
    },

    // Set the circle radius
    setCircleRadius: function (radius) {
        this.circleRadius = radius;
    },

    // Get the circle radius
    getCircleRadius: function () {
        return this.circleRadius;
    },

    // Set the circle color
    setCircleColor: function (color) {
        this.circleColor = color;
    },

    // Get the circle color
    getCircleColor: function () {
        return this.circleColor;
    },

    // Set the starting circle for the line
    setLineStartCircle: function (circle) {
        this.lineStartCircle = circle;
    },

    // Get the starting circle for the line
    getLineStartCircle: function () {
        return this.lineStartCircle;
    },

    // Set the ending circle for the line
    setLineEndCircle: function (circle) {
        this.lineEndCircle = circle;
    },

    // Get the ending circle for the line
    getLineEndCircle: function () {
        return this.lineEndCircle;
    },

    // Reset line drawing state
    resetLineDrawing: function () {
        this.isDrawingLine = false;
        this.lineStartCircle = null;
        this.lineEndCircle = null;
    },
};

export default MindMapService;