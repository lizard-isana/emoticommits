//
// Astronomical calculations are based on
// 「天体の位置計算 増補版」長沢 工著、地人書館、2001年、ISBN4-8052-0225-4
//
// This software
// Copyright (c) 2013 zunda <zunda at freeshell.org>
//
// Permission is hereby granted, free of charge, to any person
// obtaining a copy of this software and associated documentation
// files (the "Software"), to deal in the Software without
// restriction, including without limitation the rights to use,
// copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the
// Software is furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
// OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
// HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
// WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
// OTHER DEALINGS IN THE SOFTWARE.
//

var Sun = {
	et0_msec: new Date(Date.UTC(1974, 11, 31, 0)).getTime(),	// p.206
	sin_deg: function(deg){return Math.sin(deg / 180.0 * Math.PI);},
	cos_deg: function(deg){return Math.cos(deg / 180.0 * Math.PI);},
	asin_deg: function(s){return Math.asin(s) * 180.0 / Math.PI;},
	atan2_deg: function(y, x){return Math.atan2(y, x) * 180.0 / Math.PI;}
};

// Time Parameter for the time ET (Ephemeris Time) as a Date
Sun.t = function(et) {
	return (et.getTime() - Sun.et0_msec)/(365.25*24*3600*1000);	// p.207
};

// Sun's ecliptic longitude for Time Parameter
Sun.lambda_for_t = function(t) {	// p.206
	var r = 279.0358 + 360.00769*t
		+ (1.9159 - 0.00005*t) * Sun.sin_deg(356.531 + 359.991*t)
		+ 0.0200 * Sun.sin_deg(353.06 + 719.981*t)
		- 0.0048 * Sun.sin_deg(248.64 -  19.341*t)
		+ 0.0020 * Sun.sin_deg(285.0  + 329.64*t)
		+ 0.0018 * Sun.sin_deg(334.2  -4452.67*t)

		+ 0.0018 * Sun.sin_deg(293.7  -   0.20*t)
		+ 0.0015 * Sun.sin_deg(242.4  + 450.37*t)
		+ 0.0013 * Sun.sin_deg(211.1  + 225.18*t)
		+ 0.0008 * Sun.sin_deg(208.0  + 659.29*t)
		+ 0.0007 * Sun.sin_deg( 53.5  +  90.38*t)

		+ 0.0007 * Sun.sin_deg( 12.1  -  30.35*t)
		+ 0.0006 * Sun.sin_deg(239.1  + 337.18*t)
		+ 0.0005 * Sun.sin_deg( 10.1  -   1.50*t)
		+ 0.0005 * Sun.sin_deg( 99.1  -  22.81*t)
		+ 0.0004 * Sun.sin_deg(264.8  + 315.56*t)

		+ 0.0004 * Sun.sin_deg(233.8  + 299.30*t)
		- 0.0004 * Sun.sin_deg(198.1  + 720.02*t)
		+ 0.0003 * Sun.sin_deg(349.6  +1079.97*t)
		+ 0.0003 * Sun.sin_deg(241.2  -  44.43*t)
		;
	return r % 360;
};

// Difference between Epehmeris Time and UT: ET = UT + DT
Sun.dT = function(time) {
	var y = time.getTime()/(365.25*24*3600*1000) + 1970;
	return 0.895895*(y - 1960.5) + 30.7727;	// see scratch/dt.dat
};

// Epehmeris Time for UT
Sun.eT = function(time) {
	return new Date(time.getTime() + Sun.dT(time));
};

Sun.t0_msec = Sun.eT(new Date(Date.UTC(1989, 11, 31, 0))).getTime(); // p.141

// Sun's ecliptic longitude for Time
Sun.lambda = function(time) {
	return Sun.lambda_for_t(Sun.t(Sun.eT(time)));
};

// Mean obliquity of the ecliptic in degrees
Sun.mean_obliquity = function(et) {
	var t = (et.getTime() - Sun.t0_msec)/(36525*24*3600*1000);
	return 23.452294 - 0.0130125*t - 0.00000164*t*t + 0.000000503*t*t*t;
};

// Ecliptic coordinate system to equatorial coordinate system p.140
// ecliptic = {lambda: deg, beta: deg}
// returns {alpha: deg, delta: deg}
Sun.ecliptic_to_equatorial = function(ecliptic, et) {
  var cos_beta = Sun.cos_deg(ecliptic.beta);
	var u = cos_beta * Sun.cos_deg(ecliptic.lambda);
	var v = cos_beta * Sun.sin_deg(ecliptic.lambda);
	var w = Sun.sin_deg(ecliptic.beta);
	var e = Sun.mean_obliquity(et);
	var l = u;
  var cos_e = Sun.cos_deg(e);
  var sin_e = Sun.sin_deg(e);
	var m = v*cos_e - w*sin_e;
	var n = v*sin_e - w*cos_e;
	var delta = Sun.asin_deg(n);
	var alpha = Sun.atan2_deg(m, l);
	return {alpha: alpha, delta: delta};
};

// Time from 1899-12-31 UTC in unit of 36525 days
Sun.tu0_msec = new Date(Date.UTC(1899, 11, 31, 12)).getTime();
Sun.tu = function(time) {
	return (time.getTime() - Sun.tu0_msec)/(36525*24*3600*1000);
};

// Mean Greenwich Sidereal Time in degrees
Sun.gst = function(time) {
	var tu = Sun.tu(time);
	return ((6+38/60+45.836/3600)*15 +
		8640184.542/3600*15*tu + 0.0929/3600*15*tu*tu) % 360;
}

// Location of Sun
Sun.alphadelta = function(time) {
	return Sun.ecliptic_to_equatorial(
		{lambda: Sun.lambda(time), beta: 0}, Sun.eT(time));
};

Sun.latlng = function(time) {
	var sun = Sun.alphadelta(time);
	var dt = (time.getTime() - new Date(Date.UTC(time.getUTCFullYear(), time.getUTCMonth(), time.getUTCDate())).getTime())/(24*3600*1000)*360;
	var drot = dt * 1.0027391	// p.25
	var lng = (sun.alpha - Sun.gst(time) - drot) % 360;
	if (lng > 180) {lng -= 360;}
	return {lng: lng, lat: sun.delta};
}

Sun.shadowPaths = function(time) {
	var sun = Sun.latlng(time);
	if (sun.lat >= 0) {
		return [[
			{lat: -90, lng: sun.lng + 180},
			{lat: 90 - sun.lat, lng: sun.lng + 180},
			{lat: 0, lng: sun.lng + 90},
			{lat: -90, lng: sun.lng + 90},
		],[
			{lat: -90, lng: sun.lng - 180},
			{lat: 90 - sun.lat, lng: sun.lng - 180},
			{lat: 0, lng: sun.lng - 90},
			{lat: -90, lng: sun.lng - 90},
		],[
			{lat: -90, lng: sun.lng - 90},
			{lat: 0, lng: sun.lng - 90},
			{lat: sun.lat - 90, lng: sun.lng},
			{lat: -90, lng: sun.lng},
		],[
			{lat: -90, lng: sun.lng + 90},
			{lat: 0, lng: sun.lng + 90},
			{lat: sun.lat - 90, lng: sun.lng},
			{lat: -90, lng: sun.lng},
		]];
	} else {
		return [[
			{lat: 90, lng: sun.lng + 180},
			{lat: -90 - sun.lat, lng: sun.lng + 180},
			{lat: 0, lng: sun.lng + 90},
			{lat: 90, lng: sun.lng + 90},
		],[
			{lat: 90, lng: sun.lng - 180},
			{lat: -90 - sun.lat, lng: sun.lng - 180},
			{lat: 0, lng: sun.lng - 90},
			{lat: 90, lng: sun.lng - 90},
		],[
			{lat: 90, lng: sun.lng - 90},
			{lat: 0, lng: sun.lng - 90},
			{lat: sun.lat + 90, lng: sun.lng},
			{lat: 90, lng: sun.lng},
		],[
			{lat: 90, lng: sun.lng + 90},
			{lat: 0, lng: sun.lng + 90},
			{lat: sun.lat + 90, lng: sun.lng},
			{lat: 90, lng: sun.lng},
		]];
	}
};
