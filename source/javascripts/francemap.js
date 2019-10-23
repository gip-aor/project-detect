/*!
 * jQVMap Version 1.0
 *
 * http://jqvmap.com
 *
 * Copyright 2012, Peter Schmalfeldt <manifestinteractive@gmail.com>
 * Copyright 2011-2012, Kirill Lebedev
 * Licensed under the MIT license.
 *
 * Fork Me @ https://github.com/manifestinteractive/jqvmap
 */
(function ($){

  var apiParams = {
    colors: 1,
    values: 1,
    backgroundColor: 1,
    scaleColors: 1,
    normalizeFunction: 1,
    enableZoom: 1,
    showTooltip: 1,
    borderColor: 1,
    borderWidth: 1,
    borderOpacity: 1,
    selectedRegion: 1
  };

  var apiEvents = {
    onLabelShow: 'labelShow',
    onRegionOver: 'regionMouseOver',
    onRegionOut: 'regionMouseOut',
    onRegionClick: 'regionClick'
  };

  $.fn.vectorMap = function (options){

    var defaultParams = {
      map: 'world_en',
      backgroundColor: '#a5bfdd',
      color: '#f4f3f0',
      hoverColor: '#c9dfaf',
      selectedColor: '#c9dfaf',
      scaleColors: ['#b6d6ff', '#005ace'],
      normalizeFunction: 'linear',
      enableZoom: true,
      showTooltip: true,
      borderColor: '#818181',
      borderWidth: 1,
      borderOpacity: 0.25,
      selectedRegion: null
    }, map;

    if (options === 'addMap')
    {
      WorldMap.maps[arguments[1]] = arguments[2];
    }
    else if (options === 'set' && apiParams[arguments[1]])
    {
      this.data('mapObject')['set' + arguments[1].charAt(0).toUpperCase() + arguments[1].substr(1)].apply(this.data('mapObject'), Array.prototype.slice.call(arguments, 2));
    }
    else
    {
      $.extend(defaultParams, options);
      defaultParams.container = this;
      this.css({ position: 'relative', overflow: 'hidden' });

      map = new WorldMap(defaultParams);

      this.data('mapObject', map);

      for (var e in apiEvents)
      {
        if (defaultParams[e])
        {
          this.bind(apiEvents[e] + '.jqvmap', defaultParams[e]);
        }
      }
    }
  };

  var VectorCanvas = function (width, height, params)
  {
    this.mode = window.SVGAngle ? 'svg' : 'vml';
    this.params = params;

    if (this.mode == 'svg')
    {
      this.createSvgNode = function (nodeName)
      {
        return document.createElementNS(this.svgns, nodeName);
      };
    }
    else
    {
      try {
        if (!document.namespaces.rvml)
        {
          document.namespaces.add("rvml", "urn:schemas-microsoft-com:vml");
        }
        this.createVmlNode = function (tagName)
        {
          return document.createElement('<rvml:' + tagName + ' class="rvml">');
        };
      }
      catch (e)
      {
        this.createVmlNode = function (tagName)
        {
          return document.createElement('<' + tagName + ' xmlns="urn:schemas-microsoft.com:vml" class="rvml">');
        };
      }

      document.createStyleSheet().addRule(".rvml", "behavior:url(#default#VML)");
    }

    if (this.mode == 'svg')
    {
      this.canvas = this.createSvgNode('svg');
    }
    else
    {
      this.canvas = this.createVmlNode('group');
      this.canvas.style.position = 'absolute';
    }

    this.setSize(width, height);
  };

  VectorCanvas.prototype = {
    svgns: "http://www.w3.org/2000/svg",
    mode: 'svg',
    width: 0,
    height: 0,
    canvas: null,

    setSize: function (width, height)
    {
      if (this.mode == 'svg')
      {
        this.canvas.setAttribute('width', width);
        this.canvas.setAttribute('height', height);
      }
      else
      {
        this.canvas.style.width = width + "px";
        this.canvas.style.height = height + "px";
        this.canvas.coordsize = width + ' ' + height;
        this.canvas.coordorigin = "0 0";
        if (this.rootGroup)
        {
          var pathes = this.rootGroup.getElementsByTagName('shape');
          for (var i = 0, l = pathes.length; i < l; i++)
          {
            pathes[i].coordsize = width + ' ' + height;
            pathes[i].style.width = width + 'px';
            pathes[i].style.height = height + 'px';
          }
          this.rootGroup.coordsize = width + ' ' + height;
          this.rootGroup.style.width = width + 'px';
          this.rootGroup.style.height = height + 'px';
        }
      }
      this.width = width;
      this.height = height;
    },

    createPath: function (config)
    {
      var node;
      if (this.mode == 'svg')
      {
        node = this.createSvgNode('path');
        node.setAttribute('d', config.path);

        if(this.params.borderColor !== null)
        {
          node.setAttribute('stroke', this.params.borderColor);
        }
        if(this.params.borderWidth > 0)
        {
          node.setAttribute('stroke-width', this.params.borderWidth);
          node.setAttribute('stroke-linecap', 'round');
          node.setAttribute('stroke-linejoin', 'round');
        }
        if(this.params.borderOpacity > 0)
        {
          node.setAttribute('stroke-opacity', this.params.borderOpacity);
        }

        node.setFill = function (color)
        {
          this.setAttribute("fill", color);
          if(this.getAttribute("original") === null)
          {
            this.setAttribute("original", color);
          }
        };

        node.getFill = function (color)
        {
          return this.getAttribute("fill");
        };

        node.getOriginalFill = function ()
        {
          return this.getAttribute("original");
        };

        node.setOpacity = function (opacity)
        {
          this.setAttribute('fill-opacity', opacity);
        };
      }
      else
      {
        node = this.createVmlNode('shape');
        node.coordorigin = "0 0";
        node.coordsize = this.width + ' ' + this.height;
        node.style.width = this.width + 'px';
        node.style.height = this.height + 'px';
        node.fillcolor = WorldMap.defaultFillColor;
        node.stroked = false;
        node.path = VectorCanvas.pathSvgToVml(config.path);

        var scale = this.createVmlNode('skew');
        scale.on = true;
        scale.matrix = '0.01,0,0,0.01,0,0';
        scale.offset = '0,0';

        node.appendChild(scale);

        var fill = this.createVmlNode('fill');
        node.appendChild(fill);

        node.setFill = function (color)
        {
          this.getElementsByTagName('fill')[0].color = color;
        };

        node.getFill = function (color)
        {
          return this.getElementsByTagName('fill')[0].color;
        };

        node.setOpacity = function (opacity)
        {
          this.getElementsByTagName('fill')[0].opacity = parseInt(opacity * 100, 10) + '%';
        };
      }
      return node;
    },

    createGroup: function (isRoot)
    {
      var node;
      if (this.mode == 'svg')
      {
        node = this.createSvgNode('g');
      }
      else
      {
        node = this.createVmlNode('group');
        node.style.width = this.width + 'px';
        node.style.height = this.height + 'px';
        node.style.left = '0px';
        node.style.top = '0px';
        node.coordorigin = "0 0";
        node.coordsize = this.width + ' ' + this.height;
      }

      if (isRoot)
      {
        this.rootGroup = node;
      }
      return node;
    },

    applyTransformParams: function (scale, transX, transY)
    {
      if (this.mode == 'svg')
      {
        this.rootGroup.setAttribute('transform', 'scale(' + scale + ') translate(' + transX + ', ' + transY + ')');
      }
      else
      {
        this.rootGroup.coordorigin = (this.width - transX) + ',' + (this.height - transY);
        this.rootGroup.coordsize = this.width / scale + ',' + this.height / scale;
      }
    }
  };

  VectorCanvas.pathSvgToVml = function (path)
  {
    var result = '';
    var cx = 0, cy = 0, ctrlx, ctrly;

    return path.replace(/([MmLlHhVvCcSs])((?:-?(?:\d+)?(?:\.\d+)?,?\s?)+)/g, function (segment, letter, coords, index)
                        {
      coords = coords.replace(/(\d)-/g, '$1,-').replace(/\s+/g, ',').split(',');
      if (!coords[0])
      {
        coords.shift();
      }

      for (var i = 0, l = coords.length; i < l; i++)
      {
        coords[i] = Math.round(100 * coords[i]);
      }

      switch (letter)
          {
        case 'm':
          cx += coords[0];
          cy += coords[1];
          return 't' + coords.join(',');
          break;

        case 'M':
          cx = coords[0];
          cy = coords[1];
          return 'm' + coords.join(',');
          break;

        case 'l':
          cx += coords[0];
          cy += coords[1];
          return 'r' + coords.join(',');
          break;

        case 'L':
          cx = coords[0];
          cy = coords[1];
          return 'l' + coords.join(',');
          break;

        case 'h':
          cx += coords[0];
          return 'r' + coords[0] + ',0';
          break;

        case 'H':
          cx = coords[0];
          return 'l' + cx + ',' + cy;
          break;

        case 'v':
          cy += coords[0];
          return 'r0,' + coords[0];
          break;

        case 'V':
          cy = coords[0];
          return 'l' + cx + ',' + cy;
          break;

        case 'c':
          ctrlx = cx + coords[coords.length - 4];
          ctrly = cy + coords[coords.length - 3];
          cx += coords[coords.length - 2];
          cy += coords[coords.length - 1];
          return 'v' + coords.join(',');
          break;

        case 'C':
          ctrlx = coords[coords.length - 4];
          ctrly = coords[coords.length - 3];
          cx = coords[coords.length - 2];
          cy = coords[coords.length - 1];
          return 'c' + coords.join(',');
          break;

        case 's':
          coords.unshift(cy - ctrly);
          coords.unshift(cx - ctrlx);
          ctrlx = cx + coords[coords.length - 4];
          ctrly = cy + coords[coords.length - 3];
          cx += coords[coords.length - 2];
          cy += coords[coords.length - 1];
          return 'v' + coords.join(',');
          break;

        case 'S':
          coords.unshift(cy + cy - ctrly);
          coords.unshift(cx + cx - ctrlx);
          ctrlx = coords[coords.length - 4];
          ctrly = coords[coords.length - 3];
          cx = coords[coords.length - 2];
          cy = coords[coords.length - 1];
          return 'c' + coords.join(',');
          break;

        default:
          return false;
          break;
      }

      return '';

    }).replace(/z/g, '');
  };

  var WorldMap = function (params)
  {
    params = params || {};
    var map = this;
    var mapData = WorldMap.maps[params.map];

    this.container = params.container;

    this.defaultWidth = mapData.width;
    this.defaultHeight = mapData.height;

    this.color = params.color;
    this.hoverColor = params.hoverColor;
    this.setBackgroundColor(params.backgroundColor);

    this.width = params.container.width();
    this.height = params.container.height();

    this.resize();

    jQuery(window).resize(function ()
                          {
      map.width = params.container.width();
      map.height = params.container.height();
      map.resize();
      map.canvas.setSize(map.width, map.height);
      map.applyTransform();
    });

    this.canvas = new VectorCanvas(this.width, this.height, params);
    params.container.append(this.canvas.canvas);

    this.makeDraggable();

    this.rootGroup = this.canvas.createGroup(true);

    this.index = WorldMap.mapIndex;
    this.label = jQuery('<div/>').addClass('jqvmap-label').appendTo(jQuery('body'));

    if(params.enableZoom)
    {
      jQuery('<div/>').addClass('jqvmap-zoomin').text('+').appendTo(params.container);
      jQuery('<div/>').addClass('jqvmap-zoomout').html('&#x2212;').appendTo(params.container);
    }

    map.countries = [];

    for (var key in mapData.pathes)
    {
      var path = this.canvas.createPath({
        path: mapData.pathes[key].path
      });

      path.setFill(this.color);
      path.id = 'jqvmap' + map.index + '_' + key;
      map.countries[key] = path;

      jQuery(this.rootGroup).append(path);

      path.setAttribute('class', 'jqvmap-region');

      if(params.selectedRegion !== null)
      {
        if(key.toLowerCase() == params.selectedRegion.toLowerCase())
        {
          path.setFill(params.selectedColor);
        }
      }
    }

    jQuery(params.container).delegate(this.canvas.mode == 'svg' ? 'path' : 'shape', 'mouseover mouseout', function (e){
      var path = e.target,
          code = e.target.id.split('_').pop(),
          labelShowEvent = $.Event('labelShow.jqvmap'),
          regionMouseOverEvent = $.Event('regionMouseOver.jqvmap');

      if (e.type == 'mouseover')
      {
        jQuery(params.container).trigger(regionMouseOverEvent, [code, mapData.pathes[code].name]);
        if (!regionMouseOverEvent.isDefaultPrevented())
        {
          if (params.hoverOpacity)
          {
            path.setOpacity(params.hoverOpacity);
          }
          else if (params.hoverColor)
          {
            path.currentFillColor = path.getFill() + '';
            path.setFill(params.hoverColor);
          }
        }
        if(params.showTooltip)
        {
          map.label.text(mapData.pathes[code].name);
          jQuery(params.container).trigger(labelShowEvent, [map.label, code]);

          if (!labelShowEvent.isDefaultPrevented())
          {
            map.label.show();
            map.labelWidth = map.label.width();
            map.labelHeight = map.label.height();
          }
        }
      }
      else
      {
        path.setOpacity(1);
        if (path.currentFillColor)
        {
          path.setFill(path.currentFillColor);
        }

        map.label.hide();
        jQuery(params.container).trigger('regionMouseOut.jqvmap', [code, mapData.pathes[code].name]);
      }
    });

    jQuery(params.container).delegate(this.canvas.mode == 'svg' ? 'path' : 'shape', 'click', function (e){

      for (var key in mapData.pathes)
      {
        map.countries[key].currentFillColor = map.countries[key].getOriginalFill();
        map.countries[key].setFill(map.countries[key].getOriginalFill());
      }

      var path = e.target;
      var code = e.target.id.split('_').pop();

      jQuery(params.container).trigger('regionClick.jqvmap', [code, mapData.pathes[code].name]);

      path.currentFillColor = params.selectedColor;
      path.setFill(params.selectedColor);

    });

    if(params.showTooltip)
    {
      params.container.mousemove(function (e){
        if (map.label.is(':visible'))
        {
          map.label.css({
            left: e.pageX - 15 - map.labelWidth,
            top: e.pageY - 15 - map.labelHeight
          });
        }
      });
    }

    this.setColors(params.colors);

    this.canvas.canvas.appendChild(this.rootGroup);

    this.applyTransform();

    this.colorScale = new ColorScale(params.scaleColors, params.normalizeFunction, params.valueMin, params.valueMax);

    if (params.values)
    {
      this.values = params.values;
      this.setValues(params.values);
    }

    this.bindZoomButtons();

    WorldMap.mapIndex++;
  };

  WorldMap.prototype = {
    transX: 0,
    transY: 0,
    scale: 1,
    baseTransX: 0,
    baseTransY: 0,
    baseScale: 1,
    width: 0,
    height: 0,
    countries: {},
    countriesColors: {},
    countriesData: {},
    zoomStep: 1.4,
    zoomMaxStep: 4,
    zoomCurStep: 1,

    setColors: function (key, color)
    {
      if (typeof key == 'string')
      {
        this.countries[key].setFill(color);
        this.countries[key].setAttribute("original", color);
      }
      else
      {
        var colors = key;

        for (var code in colors)
        {
          if (this.countries[code])
          {
            this.countries[code].setFill(colors[code]);
            this.countries[code].setAttribute("original", colors[code]);
          }
        }
      }
    },

    setValues: function (values)
    {
      var max = 0,
          min = Number.MAX_VALUE,
          val;

      for (var cc in values)
      {
        val = parseFloat(values[cc]);
        if (val > max)
        {
          max = values[cc];
        }
        if (val && val < min)
        {
          min = val;
        }
      }

      this.colorScale.setMin(min);
      this.colorScale.setMax(max);

      var colors = {};
      for (cc in values)
      {
        val = parseFloat(values[cc]);
        if (val)
        {
          colors[cc] = this.colorScale.getColor(val);
        }
        else
        {
          colors[cc] = this.color;
        }
      }
      this.setColors(colors);
      this.values = values;
    },

    setBackgroundColor: function (backgroundColor)
    {
      this.container.css('background-color', backgroundColor);
    },

    setScaleColors: function (colors)
    {
      this.colorScale.setColors(colors);

      if (this.values)
      {
        this.setValues(this.values);
      }
    },

    setNormalizeFunction: function (f)
    {
      this.colorScale.setNormalizeFunction(f);

      if (this.values)
      {
        this.setValues(this.values);
      }
    },

    resize: function ()
    {
      var curBaseScale = this.baseScale;
      if (this.width / this.height > this.defaultWidth / this.defaultHeight)
      {
        this.baseScale = this.height / this.defaultHeight;
        this.baseTransX = Math.abs(this.width - this.defaultWidth * this.baseScale) / (2 * this.baseScale);
      }
      else
      {
        this.baseScale = this.width / this.defaultWidth;
        this.baseTransY = Math.abs(this.height - this.defaultHeight * this.baseScale) / (2 * this.baseScale);
      }
      this.scale *= this.baseScale / curBaseScale;
      this.transX *= this.baseScale / curBaseScale;
      this.transY *= this.baseScale / curBaseScale;
    },

    reset: function ()
    {
      this.countryTitle.reset();
      for (var key in this.countries)
      {
        this.countries[key].setFill(WorldMap.defaultColor);
      }
      this.scale = this.baseScale;
      this.transX = this.baseTransX;
      this.transY = this.baseTransY;
      this.applyTransform();
    },

    applyTransform: function ()
    {
      var maxTransX, maxTransY, minTransX, minTransY;
      if (this.defaultWidth * this.scale <= this.width)
      {
        maxTransX = (this.width - this.defaultWidth * this.scale) / (2 * this.scale);
        minTransX = (this.width - this.defaultWidth * this.scale) / (2 * this.scale);
      }
      else
      {
        maxTransX = 0;
        minTransX = (this.width - this.defaultWidth * this.scale) / this.scale;
      }

      if (this.defaultHeight * this.scale <= this.height)
      {
        maxTransY = (this.height - this.defaultHeight * this.scale) / (2 * this.scale);
        minTransY = (this.height - this.defaultHeight * this.scale) / (2 * this.scale);
      }
      else
      {
        maxTransY = 0;
        minTransY = (this.height - this.defaultHeight * this.scale) / this.scale;
      }

      if (this.transY > maxTransY)
      {
        this.transY = maxTransY;
      }
      else if (this.transY < minTransY)
      {
        this.transY = minTransY;
      }
      if (this.transX > maxTransX)
      {
        this.transX = maxTransX;
      }
      else if (this.transX < minTransX)
      {
        this.transX = minTransX;
      }

      this.canvas.applyTransformParams(this.scale, this.transX, this.transY);
    },

    makeDraggable: function ()
    {
      var mouseDown = false;
      var oldPageX, oldPageY;
      var self = this;

      this.container.mousemove(function (e){

        if (mouseDown)
        {
          var curTransX = self.transX;
          var curTransY = self.transY;

          self.transX -= (oldPageX - e.pageX) / self.scale;
          self.transY -= (oldPageY - e.pageY) / self.scale;

          self.applyTransform();

          oldPageX = e.pageX;
          oldPageY = e.pageY;
        }

        return false;

      }).mousedown(function (e){

        mouseDown = true;
        oldPageX = e.pageX;
        oldPageY = e.pageY;

        return false;

      }).mouseup(function (){

        mouseDown = false;
        return false;

      });
    },

    bindZoomButtons: function ()
    {
      var map = this;
      var sliderDelta = (jQuery('#zoom').innerHeight() - 6 * 2 - 15 * 2 - 3 * 2 - 7 - 6) / (this.zoomMaxStep - this.zoomCurStep);

      this.container.find('.jqvmap-zoomin').click(function ()
                                                  {
        if (map.zoomCurStep < map.zoomMaxStep)
        {
          var curTransX = map.transX;
          var curTransY = map.transY;
          var curScale = map.scale;

          map.transX -= (map.width / map.scale - map.width / (map.scale * map.zoomStep)) / 2;
          map.transY -= (map.height / map.scale - map.height / (map.scale * map.zoomStep)) / 2;
          map.setScale(map.scale * map.zoomStep);
          map.zoomCurStep++;

          jQuery('#zoomSlider').css('top', parseInt(jQuery('#zoomSlider').css('top'), 10) - sliderDelta);
        }
      });

      this.container.find('.jqvmap-zoomout').click(function ()
                                                   {
        if (map.zoomCurStep > 1) {
          var curTransX = map.transX;
          var curTransY = map.transY;
          var curScale = map.scale;

          map.transX += (map.width / (map.scale / map.zoomStep) - map.width / map.scale) / 2;
          map.transY += (map.height / (map.scale / map.zoomStep) - map.height / map.scale) / 2;
          map.setScale(map.scale / map.zoomStep);
          map.zoomCurStep--;

          jQuery('#zoomSlider').css('top', parseInt(jQuery('#zoomSlider').css('top'), 10) + sliderDelta);
        }
      });
    },

    setScale: function (scale)
    {
      this.scale = scale;
      this.applyTransform();
    },

    getCountryPath: function (cc)
    {
      return jQuery('#' + cc)[0];
    }
  };

  WorldMap.xlink = "http://www.w3.org/1999/xlink";
  WorldMap.mapIndex = 1;
  WorldMap.maps = {};

  var ColorScale = function (colors, normalizeFunction, minValue, maxValue)
  {
    if (colors)
    {
      this.setColors(colors);
    }
    if (normalizeFunction)
    {
      this.setNormalizeFunction(normalizeFunction);
    }
    if (minValue)
    {
      this.setMin(minValue);
    }
    if (minValue)
    {
      this.setMax(maxValue);
    }
  };

  ColorScale.prototype = {
    colors: [],

    setMin: function (min)
    {
      this.clearMinValue = min;

      if (typeof this.normalize === 'function')
      {
        this.minValue = this.normalize(min);
      }
      else
      {
        this.minValue = min;
      }
    },

    setMax: function (max)
    {
      this.clearMaxValue = max;
      if (typeof this.normalize === 'function')
      {
        this.maxValue = this.normalize(max);
      }
      else
      {
        this.maxValue = max;
      }
    },

    setColors: function (colors)
    {
      for (var i = 0; i < colors.length; i++)
      {
        colors[i] = ColorScale.rgbToArray(colors[i]);
      }
      this.colors = colors;
    },

    setNormalizeFunction: function (f)
    {
      if (f === 'polynomial')
      {
        this.normalize = function (value)
        {
          return Math.pow(value, 0.2);
        };
      }
      else if (f === 'linear')
      {
        delete this.normalize;
      }
      else
      {
        this.normalize = f;
      }
      this.setMin(this.clearMinValue);
      this.setMax(this.clearMaxValue);
    },

    getColor: function (value)
    {
      if (typeof this.normalize === 'function')
      {
        value = this.normalize(value);
      }

      var lengthes = [];
      var fullLength = 0;
      var l;

      for (var i = 0; i < this.colors.length - 1; i++)
      {
        l = this.vectorLength(this.vectorSubtract(this.colors[i + 1], this.colors[i]));
        lengthes.push(l);
        fullLength += l;
      }

      var c = (this.maxValue - this.minValue) / fullLength;

      for (i = 0; i < lengthes.length; i++)
      {
        lengthes[i] *= c;
      }

      i = 0;
      value -= this.minValue;

      while (value - lengthes[i] >= 0)
      {
        value -= lengthes[i];
        i++;
      }

      var color;
      if (i == this.colors.length - 1)
      {
        color = this.vectorToNum(this.colors[i]).toString(16);
      }
      else
      {
        color = (this.vectorToNum(this.vectorAdd(this.colors[i], this.vectorMult(this.vectorSubtract(this.colors[i + 1], this.colors[i]), (value) / (lengthes[i]))))).toString(16);
      }

      while (color.length < 6)
      {
        color = '0' + color;
      }
      return '#' + color;
    },

    vectorToNum: function (vector)
    {
      var num = 0;
      for (var i = 0; i < vector.length; i++)
      {
        num += Math.round(vector[i]) * Math.pow(256, vector.length - i - 1);
      }
      return num;
    },

    vectorSubtract: function (vector1, vector2)
    {
      var vector = [];
      for (var i = 0; i < vector1.length; i++)
      {
        vector[i] = vector1[i] - vector2[i];
      }
      return vector;
    },

    vectorAdd: function (vector1, vector2)
    {
      var vector = [];
      for (var i = 0; i < vector1.length; i++)
      {
        vector[i] = vector1[i] + vector2[i];
      }
      return vector;
    },

    vectorMult: function (vector, num)
    {
      var result = [];
      for (var i = 0; i < vector.length; i++)
      {
        result[i] = vector[i] * num;
      }
      return result;
    },

    vectorLength: function (vector)
    {
      var result = 0;
      for (var i = 0; i < vector.length; i++)
      {
        result += vector[i] * vector[i];
      }
      return Math.sqrt(result);
    }
  };

  ColorScale.arrayToRgb = function (ar)
  {
    var rgb = '#';
    var d;
    for (var i = 0; i < ar.length; i++)
    {
      d = ar[i].toString(16);
      rgb += d.length == 1 ? '0' + d : d;
    }
    return rgb;
  };

  ColorScale.rgbToArray = function (rgb)
  {
    rgb = rgb.substr(1);
    return [parseInt(rgb.substr(0, 2), 16), parseInt(rgb.substr(2, 2), 16), parseInt(rgb.substr(4, 2), 16)];
  };

})(jQuery);



jQuery.fn.vectorMap('addMap','france_fr',
{"width":330,
 "pathes":{
   "201":{"path":"M275.2,70.9L270.9,69.4L263.6,69.1L259.4,65.4L256.3,67.5L252.8,66.9L251.5,67.5L250.4,65.5L248.9,64.8L247.5,65.6L247.4,67.1L246,66.7L242,62.2L241.1,59.2L239.6,58.2L234.1,56.9L231.9,58.7L230.5,58.7L227.8,57.5L226.1,56.1L222.7,56.1L222.1,57.5L219.3,57.8L217.5,54.2L216,54.4L216,52.8L213,52L209.6,49.1L206.6,49.1L207.1,45.9L205.7,43.1L205.7,41L207,38.4L205.6,37.7L203.6,39.8L202.7,43.1L198.4,45L195.7,44.1L194.3,44.4L194.7,47.3L194,49L194.7,50.6L192.2,54.2L190.8,54.3L190.9,61.4L190.5,62.9L187.8,61.9L183.8,63.9L183.2,65.3L184.8,69.3L182.1,70.4L182.9,71.6L182.4,73L183.7,73.6L179.9,78.7L179.6,79.7L178.4,80.8L180.1,85L181.4,85.8L179.9,88.3L178.4,88.7L178.6,93L180.5,93.7L182.7,96.5L183.9,100.6L184.9,99.5L186.7,101.6L189.2,107L195.5,106.2L197,106.9L198.1,105.9L201.2,105.5L203.5,103.5L205.4,103.8L207.2,104.1L207.5,105.5L208.8,106L208.6,107.4L210.1,107.6L210.9,108.7L211.5,110.2L210.1,111.4L211.2,113.8L215.8,114.8L217.3,115.6L217.3,117L219.7,116.1L220.3,114.8L223.6,112.9L224.7,113.8L226.2,113.3L226.4,109.1L227.4,107.9L228.9,108.1L230,106.5L229.9,105.8L233.9,102.9L237.4,105L240.3,104.2L242.7,106L245.3,104.9L249.5,108.2L250,107.9L253.8,110.4L254,114.9L255.4,114.8L256.4,117.4L254.5,117.6L254.5,117.7L256.3,117.4L257.7,117.8L257.3,119.2L261.1,119.3L262.4,118.8L262.7,117.2L264.2,117.2L264.3,115.6L265.4,114.6L263.9,110.7L265.3,103L264.3,97.9L267.3,90.9L268,83.1L273.3,76.2L275.2,70.9z","name":"Alsace-Champagne-Ardenne-Lorraine"},
   "202":{"path":"M 79.4,172.2 L 80,174.4 L 83.9,176.8 L 89.1,182.4 L 90.2,186.1 L 90.2,186.2 L 90.5,187.6 L 89.4,189.2 L 88.1,185.3 L 82.8,180.1 L 82.3,178.7 L 80.9,181.5 L 77.8,206.6 L 79.8,202.7 L 82,205.3 L 82.1,206.7 L 78.9,206.3 L 77.3,209.7 L 77.3,212.1 L 71.9,237.1 L 69.9,240.6 L 67.6,243.8 L 64.5,246.1 L 67.4,247.5 L 67.6,249 L 68.8,248 L 72,248.6 L 72.8,250.1 L 71.8,253 L 70.5,254.2 L 71.1,255.6 L 73.1,256.1 L 73.3,254.3 L 74.8,253.8 L 74.9,255.5 L 77.9,257.1 L 82.7,258.9 L 85.8,258.8 L 87.1,261.1 L 91,264.4 L 92.2,263.5 L 93.4,264.2 L 96.3,262.7 L 96.4,262.7 L 97,258.4 L 97.8,257 L 99.5,256.6 L 99.3,255.1 L 103.3,250.5 L 102.9,248.9 L 104.2,248.2 L 104,244.6 L 102.6,244.6 L 103.3,243.2 L 102.1,240.3 L 102,240.3 L 98.7,240.2 L 98,238.8 L 100.1,233.3 L 99.8,230.1 L 104.5,228.7 L 104.8,230.2 L 106.1,229.6 L 106.2,228.1 L 106.2,228.1 L 108.1,228.5 L 108.8,227.2 L 113,227.5 L 115.5,226.1 L 119.8,226.6 L 121.1,226 L 122.9,223.6 L 124.3,223.7 L 123.6,222.3 L 125.8,219.6 L 124.6,218.9 L 124.6,217.4 L 128.3,216.4 L 127.1,211.9 L 128.8,210.3 L 131.1,207.1 L 134.1,205.4 L 133.8,203.6 L 136.1,202 L 137.1,196.8 L 141.1,196.4 L 144.5,199.5 L 147.1,198.1 L 150.5,198.2 L 152.2,197.3 L 151.4,195.6 L 153,195 L 153.1,193.3 L 154.3,192.3 L 153.3,191.2 L 157.1,186.5 L 157.5,184.7 L 160.6,185.7 L 159.6,178.8 L 160.5,177.6 L 159.9,174.8 L 157.6,172 L 162.3,167.7 L 161.2,164.4 L 161.4,162.3 L 159.6,158.2 C 158.4,157.3 157.2,156.5 155.9,155.7 L 155.4,153.8 L 152.9,153.7 L 151.5,154.1 L 144.9,152.7 L 144,154 L 138.3,154.5 L 136.8,156 L 136,154.7 L 133.1,155.3 L 131.8,154.7 L 132.6,153.3 L 131.3,152.7 L 130,150 L 128.6,150 L 126.2,147.8 L 126.6,144.9 L 122,138.4 L 121.9,136.8 L 119.2,135.3 L 120,136.8 L 115,137 L 113.6,136.3 L 112.9,133.2 L 111.4,133.4 L 111.3,131.8 L 108.6,130.2 L 105.2,133.1 L 104.1,132 L 99.3,132.1 L 96.5,132.5 L 94.6,134.9 L 88.5,135.3 L 89.6,138.1 L 91.7,140.2 L 94.1,149.2 L 94,152.8 L 95.2,153.8 L 90.7,156.1 L 89.5,155.2 L 86.3,155.3 L 87,153.9 L 82.6,155.6 L 80.3,160.4 L 81.7,160.8 L 83.8,164.8 L 82.4,165.1 L 83.2,167.7 L 81.7,170.7 L 79.4,172.2 z M 101.9,249 L 102,250.4 L 100.8,249.6 L 101.9,249 z M 74.2,157.2 L 74.2,157.1 L 74.7,158.3 L 75.3,158.2 L 77.6,160.2 L 79,159.5 L 76.3,157.8 L 76.3,157.8 L 74.2,157.2 z M 79.9,165.8 L 77.3,164.2 L 76.4,165.5 L 79.7,171.1 L 80.3,169.5 L 79.9,165.8 z","name":"Aquitaine-Limousin-Poitou-Charentes"},
   "219":{"path":"M 166.8,144 L 162.6,145.5 L 161.5,146.4 L 162.3,149.1 L 161.5,150.3 L 157.1,150.8 L 155.3,153.7 L 155.4,153.8 L 155.9,155.7 C 157.2,156.5 158.4,157.3 159.6,158.2 L 161.4,162.3 L 161.2,164.4 L 162.3,167.7 L 157.6,172 L 159.9,174.8 L 160.5,177.6 L 159.6,178.8 L 160.6,185.7 L 157.5,184.7 L 157.1,186.5 L 153.3,191.2 L 154.3,192.3 L 153.1,193.3 L 153,195 L 151.4,195.6 L 152.2,197.3 L 150.5,198.2 L 151,200.9 L 152.9,203.9 L 152,206.8 L 153.7,209.3 L 156.3,207.7 L 159.4,208.5 L 161.3,206.1 L 162.8,201.5 L 165.2,199.4 L 167.8,201.4 L 168.4,203.5 L 169.6,204.3 L 169.4,205.8 L 170.7,208.4 L 174.1,200.4 L 175,201.6 L 178.9,198.2 L 180,199.1 L 180.8,201.9 L 184,202.5 L 184.1,201.1 L 185.5,201.2 L 190,205.1 L 191,209.6 L 194.5,216.7 L 198.4,219.2 L 201.9,217 L 202,218.6 L 203.3,217.5 L 204.6,217.5 L 207.7,219.2 L 207.6,217.4 L 210.5,217.7 L 212.3,219.8 L 216.6,217.9 L 217.8,218.6 L 219.1,217.5 L 219.3,220.4 L 224,220.8 L 224.1,222.2 L 226.7,223.4 L 228.8,221 L 230,220.9 L 230.5,220.8 L 230.6,218.5 L 225.6,215.6 L 224.8,214.3 L 226.4,211.8 L 228.5,212.5 L 229.8,211.2 L 228.3,210.1 L 229.5,206.7 L 232.4,206.5 L 232.6,204.9 L 233,203.3 L 235.8,202.7 L 236.2,201.3 L 242.5,199.4 L 244.1,199.9 L 244.3,197 L 242.1,195.5 L 241.2,193.4 L 242,191.5 L 245.9,193.2 L 246.9,192.2 L 249.9,191.6 L 249.9,191.6 L 259.6,187.5 L 260.6,185.6 L 259.9,184.3 L 261.4,181.7 L 257.7,179.2 L 256.6,176.4 L 256.9,174.9 L 254.2,173.7 L 252.7,172.4 L 252.5,170.9 L 252.5,170.8 L 252.6,170.7 L 256.7,166.7 L 257.2,165.2 L 255.5,162.9 L 251.6,159.2 L 252.8,156.1 L 250.9,153.4 L 251.1,152 L 249.5,151.7 L 245.2,151.9 L 242.7,154 L 241,153.3 L 239.6,156.2 L 240.8,157.7 L 237.3,160.4 L 233.8,160.9 L 234.1,158.3 L 236.9,156.6 L 237.5,153.1 L 235.8,152.1 L 233.4,155.4 L 230.7,157 L 228.7,157.1 L 228.5,155.7 L 226.9,154.9 L 224.9,157.1 L 223.4,157.2 L 223.4,155.7 L 221.9,155.7 L 219.8,151.8 L 217.3,150.2 L 214.6,150.8 L 211.7,150 L 208.8,160.5 L 205.9,156.7 L 205.1,157.8 L 203.9,157 L 202.7,157.8 L 201.7,157 L 200.5,157.9 L 200.3,159.4 L 197.5,161.3 L 196.4,160.3 L 192.4,161 L 189.9,159.4 L 189.9,157.9 L 191.7,155.6 L 192,152.8 L 191.1,151.7 L 187.2,150.2 L 183.9,143.4 L 180.9,146.4 L 178.7,144.6 L 177.3,145.4 L 174.1,145.3 L 171.2,142.2 L 169.2,142.2 L 166.8,144 z M 216.9,215.5 L 215.7,217.2 L 213.7,217.8 L 212.7,216.7 L 213.3,215.2 L 214.6,214.1 L 216.9,215.5 z","name":"Auvergne-Rhône-Alpes"},
   "204":{"path":"M170.9,94.5L170.8,97.4L168.9,100.1L172.2,103.8L172.4,106.7L170.1,109.2L170.7,110.6L169.9,111.8L167.2,113.5L168.7,114.9L169.9,118.3L168.4,118.7L167.7,119.9L168.7,123.1L167.8,126L169.2,127.1L170.8,130.9L170.9,133.8L172,134.8L171.2,142.2L174.1,145.3L177.3,145.4L178.7,144.6L180.9,146.4L183.9,143.4L187.2,150.2L191.1,151.7L192,152.8L191.7,155.6L189.9,157.9L189.9,159.4L192.4,161L196.4,160.3L197.5,161.3L200.3,159.4L200.5,157.9L201.7,157L202.7,157.8L203.9,157L205.1,157.8L205.9,156.7L208.8,160.5L211.7,150L214.6,150.8L217.3,150.2L219.8,151.8L221.9,155.7L223.4,155.7L223.4,157.2L224.9,157.1L226.9,154.9L228.5,155.7L228.7,157.1L230.7,157L233.4,155.4L235.8,152.1L235.7,152L237.5,146L243.3,140.6L242.9,135.8L247.2,132.8L253.1,125.6L253,124.1L254.1,123.1L252,121.3L252.4,119.8L252.5,119.7L254.3,117.7L254.5,117.7L254.5,117.6L256.4,117.4L255.4,114.8L254,114.9L253.8,110.4L250,107.9L249.5,108.2L245.3,104.9L242.7,106L240.3,104.2L237.4,105L233.9,102.9L229.9,105.8L230,106.5L228.9,108.1L227.4,107.9L226.4,109.1L226.2,113.3L224.7,113.8L223.6,112.9L220.3,114.8L219.7,116.1L217.3,117L217.3,115.6L215.8,114.8L211.2,113.8L210.1,111.4L211.5,110.2L210.9,108.7L210.1,107.6L208.6,107.4L208.8,106L207.5,105.5L207.2,104.1L205.4,103.8L203.5,103.5L201.2,105.5L198.1,105.9L197,106.9L195.5,106.2L189.2,107L186.7,101.6L184.9,99.5L183.9,100.6L182.7,96.5L180.5,93.7L178.6,93L170.9,94.5z","name":"Bourgogne-Franche-Comté"},
   "205":{"path":"M86,95.2L86.8,94L86.8,88L84.1,86.8L80.5,89.2L79.2,88.7L76.8,83.9L71,84L71.2,81.1L69.5,81.5L67.6,83.4L68.7,86.1L67.7,85.3L66.9,83.1L65.4,83.1L65.4,84L63.4,84.2L62.9,82.6L61.3,83.3L60.8,82L59,82.2L53.7,86.6L53.2,84.8L51.2,83.5L51.2,81.9L48.9,78L47.4,77.7L47.7,76.3L46.2,76.5L45.4,78L46.1,74.7L43.7,76.3L43.4,74.5L39,76.3L38.3,75.1L36,76.9L35.9,80L34.3,80.2L34.2,80.2L31.8,78.8L30.4,79.1L30.1,80.8L29,79.4L28.2,81L28.1,77.8L20.9,79.9L20.2,78.6L15.1,81.4L16.4,82L12.2,81.6L11.2,82.8L10.5,87.3L11.4,88.5L12.8,87.9L14.1,88.5L20.2,86.7L18.4,87.5L18.1,89.2L21.1,88.5L20.9,90L22.3,90.6L20.8,90.9L23.9,92.2L20.9,91.5L20.3,90.3L18.4,90.8L15.5,90.2L14.6,89L13.9,90.9L15.1,93.5L16,92.1L17.4,92.2L20.1,93.8L20.5,95.4L19.7,96.6L18.4,96L12.2,96.6L11.4,97.8L16.2,99.6L18,102.7L17.5,105.5L21.2,105.8L23,103.7L23,103.5L23,103.5L22.6,102.1L23.1,102L23.3,100.4L24,101.9L23.1,102L23,103.5L24.5,104.5L26.8,103.7L29.1,106.6L30.5,106.3L30.5,104.9L30.7,106.3L32,105.9L31.7,107.3L33.1,107.6L35,106.8L35.1,105.3L35.5,109.2L36.8,109.9L38.1,109.3L37.9,106.3L38.1,107.8L39.7,108.1L38.6,109.2L39.3,110.5L41.2,111.3L42.5,110.7L41.3,111.3L41.4,112.7L42.5,114.1L42.1,116L43.2,117.1L42.6,115.7L43.9,114.5L45.5,114.1L46.7,115L46.1,112.1L47.7,114.5L48.4,113.3L50.3,113.6L51.3,114.8L50.3,116L47.2,115.6L49.6,117.5L55.8,117L57.1,117.8L55.6,117.8L56.4,119.1L64.1,116.9L64.3,113.9L66.9,112.2L73.5,112L74.3,110.5L78.8,108.6L82.2,110.4L82.4,109.3L84.2,105L86.9,103.9L86,95.2zM41.5,122.9L43.4,122.3L40.9,120.6L39.5,120.8L39.9,122.5L41.5,122.9z","name":"Bretagne"},
   "206":{"path":"M172.4,106.7L172.2,103.8L168.9,100.1L163.3,101.4L158.7,101.1L160,100.3L160.3,98.9L158.2,96.8L157.9,95.3L156,95L154.6,95.9L153.9,94.5L152.9,95.9L149.5,96.3L149.4,96.3L148,91L146.5,91.4L145.3,90.3L144.7,87.5L141.7,84.8L141.4,79.3L139.6,76L136.6,79.5L136.7,80.9L133.7,81.5L132.3,80.7L129.6,82.3L126.7,82.9L125.5,84.2L125.5,85.8L127.9,88L127.8,90.2L128.1,92.5L124.3,95.1L124.8,98.8L124.9,98.8L125.9,100.7L125.7,101.6L125.7,101.7L124.7,102.7L125.6,103.8L125.7,106.6L122.6,111.9L121,112.4L120.7,114.2L116.9,116.4L115.5,116.3L115.7,117.9L112.7,116.6L112.3,117.8L111.4,122.5L108.6,130.1L108.6,130.2L111.3,131.8L111.4,133.4L112.9,133.2L113.6,136.3L115,137L120,136.8L119.2,135.3L121.9,136.8L122,138.4L126.6,144.9L126.2,147.8L128.6,150L130,150L131.3,152.7L132.6,153.3L131.8,154.7L133.1,155.3L136,154.7L136.8,156L138.3,154.5L144,154L144.9,152.7L151.5,154.1L152.9,153.7L155.4,153.8L155.3,153.7L157.1,150.8L161.5,150.3L162.3,149.1L161.5,146.4L162.6,145.5L166.8,144L169.2,142.2L171.2,142.2L172,134.8L170.9,133.8L170.8,130.9L169.2,127.1L167.8,126L168.7,123.1L167.7,119.9L168.4,118.7L169.9,118.3L168.7,114.9L167.2,113.5L169.9,111.8L170.7,110.6L170.1,109.2L172.4,106.7z","name":"Centre"},
   "208":{"path":"M280.3,246.2L279.4,241.7L277.9,241.1L276.8,242.1L277,250.8L272.7,250.2L270.9,252.6L265.6,254.7L265.2,256.2L263.8,256.3L262.7,257.7L262.8,259.4L260.9,261.9L260.6,263.4L261.9,262.9L263.8,265L261.2,266.9L261.7,269.6L265.6,271.8L264.4,272.6L262.9,276.8L266.4,275.5L266.9,278.4L265.6,281.9L270.4,282.9L267.9,284.6L267.8,286L270.2,288.2L275.8,289.9L276.4,291.3L277.9,291.9L280.9,284.6L279.2,284.4L280.5,283.4L281.6,280.7L281.2,273.3L283.9,267.4L282,254.3L279.9,251.5L280.3,246.2z","name":"Corse"},
   "213":{"path":"M141.1,196.4L137.1,196.8L136.1,202L133.8,203.6L134.1,205.4L131.1,207.1L128.8,210.3L127.1,211.9L128.3,216.4L124.6,217.4L124.6,218.9L125.8,219.6L123.6,222.3L124.3,223.7L122.9,223.6L121.1,226L119.8,226.6L115.5,226.1L113,227.5L108.8,227.2L108.1,228.5L106.2,228.1L106.2,228.1L106.1,229.6L104.8,230.2L104.5,228.7L99.8,230.1L100.1,233.3L98,238.8L98.7,240.2L102,240.3L102.1,240.3L103.3,243.2L102.6,244.6L104,244.6L104.2,248.2L102.9,248.9L103.3,250.5L99.3,255.1L99.5,256.6L97.8,257L97,258.4L96.4,262.7L102,267.7L108.1,266.9L109.3,267.9L117.4,268L118.5,266.9L118.4,263.6L119.6,263L127.9,265.4L130.3,267.6L133.5,267.4L136.3,271.2L136.9,269.7L138.6,269.6L143.8,272.2L142.9,274.6L147.3,275.9L148.5,278.7L150.1,278.8L152.3,276.8L153.9,276.8L158.6,277.8L160.9,279.6L164,279.4L164,277.9L168.1,275.8L171.2,275.2L175.5,276.4L172.6,272.8L172.7,259.1L175.5,253.7L176.8,252.4L176.8,252.4L179.5,250.4L182.9,250.4L186.2,246.7L191.7,242.7L195.9,241.6L197.4,244L198.9,244.4L199,244.4L200.9,241.4L203.8,240.5L203.3,239.2L205.4,236.8L207,237.2L208,232L212.2,227.4L209,224.2L209,221.4L207.7,219.2L204.6,217.5L203.3,217.5L202,218.6L201.9,217L198.4,219.2L194.5,216.7L191,209.6L190,205.1L185.5,201.2L184.1,201.1L184,202.5L180.8,201.9L180,199.1L178.9,198.2L175,201.6L174.1,200.4L170.7,208.4L169.4,205.8L169.6,204.3L168.4,203.5L167.8,201.4L165.2,199.4L162.8,201.5L161.3,206.1L159.4,208.5L156.3,207.7L153.7,209.3L152,206.8L152.9,203.9L151,200.9L150.5,198.2L147.1,198.1L144.5,199.5L141.1,196.4zM102,250.4l-0.1-1.4l-1.1,0.6L102,250.4z","name":"Languedoc-Roussillon-Midi-Pyrénées"},
   "211":{"path":"M173.3,73.6L173.6,72.2L172.7,71L171.4,70.6L167.3,72.1L166.1,71.3L165.1,72.4L161.6,71.9L156.2,68.7L155.1,69.5L150.5,68.4L147.3,69.3L144.5,68.7L143.7,67.1L141.8,71.9L139.8,71.8L138.7,73.1L139.6,76L141.4,79.3L141.7,84.8L144.7,87.5L145.3,90.3L146.5,91.4L148,91L149.4,96.3L149.5,96.3L152.9,95.9L153.9,94.5L154.6,95.9L156,95L157.9,95.3L158.2,96.8L160.3,98.9L160,100.3L158.7,101.1L163.3,101.4L168.9,100.1L170.8,97.4L170.9,94.5L178.6,93L178.4,88.7L179.9,88.3L181.4,85.8L180.1,85L178.4,80.8L179.6,79.7L179.9,78.7L175.2,75.7L173.3,73.6z","name":"Ile-de-France"},
   "217":{"path":"M174.2,23.3L174.5,21.8L172.5,19.6L169.6,19.9L166.8,21.8L165.3,21.1L163.9,18.6L162.2,18.6L161.6,17.2L162.1,14.3L160.9,11.3L159.5,10.5L151.2,12.6L144.5,14.7L141.6,17.1L141.6,26.1L143,27.9L141.6,27.1L141.3,30L141.5,31.9L142.7,32.7L140.8,33.4L140.6,34.9L142.2,37.7L140.8,36.9L137.5,41.4L143.8,46.7L145.5,50.9L144,53.3L144.7,57.6L144,61.6L145.7,65.8L143.7,67.1L144.5,68.7L147.3,69.3L150.5,68.4L155.1,69.5L156.2,68.7L161.6,71.9L165.1,72.4L166.1,71.3L167.3,72.1L171.4,70.6L172.7,71L173.6,72.2L173.3,73.6L175.2,75.7L179.9,78.7L183.7,73.6L182.4,73L182.9,71.6L182.1,70.4L184.8,69.3L183.2,65.3L183.8,63.9L187.8,61.9L190.5,62.9L190.9,61.4L190.8,54.3L192.2,54.2L194.7,50.6L194,49L194.7,47.3L194.3,44.4L194.1,44.4L192.3,43.8L193.9,40.7L192.4,38.1L193.4,34.8L192,35.1L190,32.7L187,33.2L184.2,32.6L183.1,33.6L182.1,29.1L179.3,28.4L178.8,27.1L177.3,28.1L175.8,27.6L174.2,23.3z","name":"Nord-Pas-de-Calais-Picardie"},
   "210":{"path":"M137.5,41.4L137.4,41.5L132,45.3L120.9,48L113.8,51.9L110.9,58.2L111.8,59.3L116.2,60.3L116.3,60.3L115.5,60.6L115.4,60.6L112,61.4L109.6,63.5L104.8,64.9L100.5,63.1L94.3,62.4L89.5,60.8L86.9,61.9L83.7,56.7L84.9,52.7L84.4,51.4L81.1,51L79.9,51.9L76.6,52.1L70.9,49.8L70.8,51.2L72.5,52.1L72.7,54.6L71.8,55.6L73,60.7L77.3,65.3L76.6,70.3L77.6,71.7L77.4,74.7L76.2,77.5L78.3,82.2L79.6,82.9L80.9,82.1L80.4,83.6L76.8,83.9L79.2,88.7L80.5,89.2L84.1,86.8L86.8,88L91.1,88.4L92.8,90.2L94,89.4L95.2,90.3L98.6,88.6L103.2,88.6L103.5,87.3L104.9,87.4L105.8,90.4L107.5,91.2L107.5,92.7L109,92.7L114.5,89.8L115.8,90.5L116.6,94.7L120.3,97.2L121.7,96.7L123.3,98.5L124.9,98.8L124.8,98.8L124.3,95.1L128.1,92.5L127.8,90.2L127.9,88L125.5,85.8L125.5,84.2L126.7,82.9L129.6,82.3L132.3,80.7L133.7,81.5L136.7,80.9L136.6,79.5L139.6,76L138.7,73.1L139.8,71.8L141.8,71.9L143.7,67.1L145.7,65.8L144,61.6L144.7,57.6L144,53.3L145.5,50.9L143.8,46.7L137.5,41.4z","name":"Normandie"},
   "216":{"path":"M86.8,94L86,95.2L86.9,103.9L84.2,105L82.4,109.3L82.2,110.4L78.8,108.6L74.3,110.5L73.5,112L66.9,112.2L64.3,113.9L64.1,116.9L56.4,119.1L54.2,121.3L55.4,124.4L58.4,124.9L59.4,125.9L61.9,124.1L65.5,123.8L62.1,125L61.8,128.4L60.3,129L63.3,130.1L65.7,132.6L61.8,136.7L62,138.9L67.2,145L68.2,148.6L72.3,151.9L74.7,152.5L75.5,154.2L78.4,154.8L80.8,156.7L81.1,155.3L82.6,155.6L87,153.9L86.3,155.3L89.5,155.2L90.7,156.1L95.2,153.8L94,152.8L94.1,149.2L91.7,140.2L89.6,138.1L88.5,135.3L94.6,134.9L96.5,132.5L99.3,132.1L104.1,132L105.2,133.1L108.6,130.2L108.6,130.1L111.4,122.5L112.3,117.8L112.7,116.6L115.7,117.9L115.5,116.3L116.9,116.4L120.7,114.2L121,112.4L122.6,111.9L125.7,106.6L125.6,103.8L124.7,102.7L125.7,101.7L125.7,101.6L125.9,100.7L124.9,98.8L123.3,98.5L121.7,96.7L120.3,97.2L116.6,94.7L115.8,90.5L114.5,89.8L109,92.7L107.5,92.7L107.5,91.2L105.8,90.4L104.9,87.4L103.5,87.3L103.2,88.6L98.6,88.6L95.2,90.3L94,89.4L92.8,90.2L91.1,88.4L86.8,88L86.8,94z","name":"Pays-de-la-Loire"},
   "215":{"path":"M242,191.5L241.2,193.4L242.1,195.5L244.3,197L244.1,199.9L242.5,199.4L236.2,201.3L235.8,202.7L233,203.3L232.6,204.9L232.4,206.5L229.5,206.7L228.3,210.1L229.8,211.2L228.5,212.5L226.4,211.8L224.8,214.3L225.6,215.6L230.6,218.5L230.5,220.8L230,220.9L228.8,221L226.7,223.4L224.1,222.2L224,220.8L219.3,220.4L219.1,217.5L217.8,218.6L216.6,217.9L212.3,219.8L210.5,217.7L207.6,217.4L207.7,219.2L209,221.4L209,224.2L212.2,227.4L208,232L207,237.2L205.4,236.8L203.3,239.2L203.8,240.5L200.9,241.4L199,244.4L206.1,244.6L207.1,245.8L206.9,247.2L208.7,247.6L213.6,247.1L212.5,245.9L213.1,244.7L214.5,244.8L216.8,247.5L223.4,246.8L225.3,251.2L230.2,252.4L231.6,252L234.7,253.8L234.6,255.2L239,253.9L242,254.7L242.6,256.1L243.6,253.4L247.3,254L247.3,252.6L250.1,251.9L251.5,250.7L253.4,250.9L254.5,248.2L252.7,247.3L255.8,243.3L258.5,242.9L260.7,239.1L263.5,237.7L264.1,235.7L271.3,231.7L271.5,228.1L274.6,223.8L275.7,221.6L273.7,219L267.7,221.1L263.1,218.7L259.9,218L256.8,214.3L257.8,211.8L255.8,209.1L256.9,208.2L257.6,205.2L257.6,205.2L257.7,205.1L258.6,204L260.4,204.1L258.5,199.4L255.5,199.2L252.9,197.6L252.5,194.3L251.1,194.2L249.9,191.6L246.9,192.2L245.9,193.2L242,191.5zM218.4,241.8L219.5,243.8L221.1,243.1L220,245L218.4,245.6L216.1,243.4L216.4,241.8L218.4,241.8zM215.7,217.2l1.2-1.7l-2.3-1.4l-1.3,1.1l-0.6,1.5l1,1.1L215.7,217.2z","name":"Provence-Alpes-Côted'Azur"},
 }
});




console.log('ready');

(function initMap() {
  //"use strict";
  $("#francemap").vectorMap({

    map: "france_fr",
    hoverColor: "#143F55",
    backgroundColor: "transparent",
    color: "#00597B",
    borderColor: "#fff",
    selectedColor: "#143F55",
    enableZoom: false,
    showTooltip: true,
     onRegionClick: function (element, code, region) {
      var link = francasbb_regions[code];
      location.assign(link);
    }
  });
})();

