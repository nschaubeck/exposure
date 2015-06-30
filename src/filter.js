var glShader = require("gl-shader");
var glslify = require("glslify");
var glFbo = require("gl-fbo");
var draw = require("a-big-triangle");
var ExposureSettings = require("./exposure_settings");

class Filter {
  constructor(gl, json) {
    this.exposureSettings = new ExposureSettings(json);
    this.gl = gl;
    this.shader = glShader(this.gl,
      glslify("./shaders/sample.vert"),
      glslify("./shaders/exposure.frag")
    );
    this.shader.attributes.position.location = 0;
    this.fbo = glFbo(gl, [gl.drawingBufferWidth, gl.drawingBufferHeight]);
    this.fbo.color[0].minFilter = gl.LINEAR;
    this.fbo.color[0].magFilter = gl.LINEAR;
  }

  bind() {
    this.fbo.bind();
    this.fbo.shape = [this.gl.drawingBufferWidth, this.gl.drawingBufferHeight];
  }

  unbind() {
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
  }

  setUniforms() {
    var settings = this.exposureSettings;
    var uniforms = this.shader.uniforms;
    uniforms.brightness = settings.brightness;
    uniforms.contrast = settings.contrast;
    uniforms.mid = settings.mid;
    // console.log(this.shader.uniforms);
  }

  draw() {
    var gl = this.gl;

    this.unbind();

    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);

    this.shader.bind();
    this.shader.uniforms.texture = this.fbo.color[0].bind(0);
    this.setUniforms();

    draw(gl);
  }
}

module.exports = Filter;
