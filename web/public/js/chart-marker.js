function ChartMarker( options ) {
    this.setValues( options );

    this.$inner = $('<div>').css({
        position: 'relative',
        left: -Math.round(parseInt(options.width)/2) + 'px', 
        top: -Math.round(parseInt(options.height)/2) + 'px', 
        width: parseInt(options.width)-4 + 'px',
        height: parseInt(options.height)-4 + 'px',
        //border: '1px solid red',
        backgroundColor: 'transparent',
        cursor: 'default',
        opacity: 0.9
    });

    this.$div = $('<div>')
        .append( this.$inner )
        .css({
            cursor: 'default',
            //border: '1px solid blue',
            position: 'absolute',
            display: 'block',
            width: '1px',
            height: '1px'
        });
};

ChartMarker.prototype = new google.maps.OverlayView;

 ChartMarker.prototype.onAdd = function() {
     $( this.getPanes().overlayMouseTarget ).append( this.$div );
 };

 ChartMarker.prototype.onRemove = function() {
     this.$div.remove();
 };
 
 ChartMarker.prototype.getProjectionPosition = function() {
      var projection = this.getProjection();
     var position = projection.fromLatLngToDivPixel( this.get('position') );
     
     return {x: position.x, y: position.y};
 };
 
  ChartMarker.prototype.getPosition = function() {
     return this.get('position');
 };

 ChartMarker.prototype.draw = function() {
     var marker = this;
     var position = this.getProjectionPosition();

     this.$div.css({
         left: position.x,
         top:position.y,
         display: 'block'
     });

     this.$inner
         .html( '<img src="' + this.get('image') + '"/>' )
         .click( function( event ) {
             var events = marker.get('events');
             events && events.click( event );
         });

     this.chart = new google.visualization.PieChart( this.$inner[0] );
     this.chart.draw( this.get('chartData'), this.get('chartOptions') );
     

 };
 
 

clusterDataCalculator = function(markers, numStyles) {
  var index = 0;
  var count = markers.length;
  var dv = count;
  while (dv !== 0) {
    dv = parseInt(dv / 10, 10);
    index++;
  }
  
  index = Math.min(index, numStyles);
  

 
  var pos = 0;
  var neu = 0;
  var neg = 0;
  
  for(var i = 0; i < count; i++) {
      var clusterData = markers[i].get('clusterData');
      pos += clusterData.pos;
      neg += clusterData.neg;
      neu += clusterData.neu;
  }
  
  var clusterData = {
      pos: pos,
      neu: neu,
      neg: neg
  };
  
  
  return {
    text: count,
    clusterData: clusterData,
    index: index
  };
};

ClusterIcon.prototype.onAdd = function() {
    
    var options = {
        width: '150px',
        height: '150px',
        
    };
    
    this.$inner = $('<div>').css({
        position: 'relative',
        left: -Math.round(parseInt(options.width)/2) + 'px', 
        top: -Math.round(parseInt(options.height)/2) + 'px', 
        width: parseInt(options.width)-4 + 'px',
        height: parseInt(options.height)-4 + 'px',
        //border: '1px solid black',
        backgroundColor: 'transparent',
        cursor: 'default',
        opacity: 0.9
    });

    this.$div = $('<div>')
        .append( this.$inner )
        .css({
            cursor: 'default',
            border: '1px solid blue',
            position: 'absolute',
            display: 'block',
            width: '1px',
            height: '1px'
        });
    
    $( this.getPanes().overlayMouseTarget ).append( this.$div );
};

 ClusterIcon.prototype.onRemove = function() {
     this.$div.remove();
 };
 
 
  ClusterIcon.prototype.draw = function() {
    if (this.visible_) {
      var position = this.getPosFromLatLng_(this.center_);
      
     
      this.$div.css({
         left: position.x,
         top:position.y
     });

     this.$inner
         .html( '<img src="' + this.get('image') + '"/>' );

    var chartOptions = {
        legend: 'none',
        backgroundColor: {
                fill:'transparent'
        },
        slices: {
            0: { color: '#16D620' },
            1: { color: '#FF9900' },
            2: { color: '#990099' }
        }
    };
    
    var chartData = google.visualization.arrayToDataTable([
        [ 'Sentiment', 'Reactions' ],
        [ 'Positive', this.sums_.clusterData.pos ],
        [ 'Neutral', this.sums_.clusterData.neu ],
        [ 'Negative', this.sums_.clusterData.neg ]
    ]);

     this.chart = new google.visualization.PieChart( this.$inner[0] );
     this.chart.draw( chartData, chartOptions );

    }


 };
 
 ClusterIcon.prototype.hide = function() {
     if(this.$div) {
      this.$div.css({
         display: 'none'
     });
 }
    this.visible_ = false;
};

ClusterIcon.prototype.show = function() {
  if (this.$div) {
    var position = this.getPosFromLatLng_(this.center_);
    
      this.$div.css({
         left: position.x,
         top:position.y,
         display: 'block'
     });

  }
  this.visible_ = true;
};