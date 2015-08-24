$(function() {

    var container = $("#flot-line-chart-slave3");
    // Determine how many data points to keep based on the placeholder's initial size;
    // this gives us a nice high-res plot while avoiding more than one point per pixel.

    var maximum = container.outerWidth() / 2 || 300;
    var cpu = [];
    var memory = [];
    var cpuUsed;
    var memUsed;
    var points = 200;

    function pad(s, length) {
        var toPad = length - s.toString().length;
        var sRet = s;
        for (var i = 0; i < toPad; i++) {
            sRet = "0" + sRet;
        }
        return sRet;
    }

    var d = new Date();

    var timestamp = d.getFullYear().toString() + pad( d.getMonth() + 1, 2 ) + pad( d.getDate() , 2) + pad(d.getHours(), 2) + pad(d.getMinutes(),2 ) + pad( d.getSeconds()-1, 2) + pad( d.getMilliseconds(), 3);
    // console.log(timestamp);

    function getInitialArray() {
        var ret = [];

        for (var i = 0; i < points; i++) {
            ret.push([i, 0]);
        }

        return ret;
    }
 
    function getCPU() {

        if (cpu.length == points) {
            cpu = cpu.slice(1);
        }
        else {
            for (var i = 0; i < points-1; i ++) {
                cpu.push(0);
            }
        }

        if (memory.length == points) {
            memory = memory.slice(1);
        }
        else {
            for (var i = 0; i < points-1; i ++) {
                memory.push(0);
            }
        }
        $.ajax({
            dataType: "json",
            url: "http://localhost:80/yiqian/performancestatus/slave3/" + timestamp,
            // url: "http://localhost:80/k8s/api/v1beta1/pods",
            contentType: "application/json",
            type: "GET",
            xhrFields: {
                withCredentials: true
            },
            success: function (result) {
                if (result != "") {
                    cpuUsed = result[0].cpu;
                    memUsed = result[0].mem;
                }
                else {
                    cpuUsed = 0;
                    memUsed = 0;
                }
            }, 
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                console.log("nothing got!");
            }
        });

        // var y = Math.random() * 10 + 20;    
        // var tmp1 = y < 0 ? 10 : y > 100 ? 100 : y;

        cpu.push(cpuUsed);
        memory.push(memUsed);

        var ret = [];
        var cpuSerie = [];
        var memorySerie = [];

        for (var i = 0; i < cpu.length; ++i) {
            cpuSerie.push([i, cpu[i]]);
        }

        memorySerie = [];
        for (var i = 0; i < memory.length; ++i) {
            memorySerie.push([i, memory[i]]);
        }

        ret[0] = cpuSerie;
        ret[1] = memorySerie;

        d = new Date();
        timestamp = d.getFullYear().toString() + pad( d.getMonth() + 1, 2 ) + pad( d.getDate() , 2) + pad(d.getHours(), 2) + pad(d.getMinutes(),2 ) + pad( d.getSeconds()-1, 2) + pad( d.getMilliseconds(), 3);
        console.log(timestamp);

        return ret;
    }

    //

    series = [{
        data: getInitialArray(),
        lines: {
            fill: true
        }
    },
    {
        data: getInitialArray(),
        lines: {
            fill: false
        }
    }
    ];


    //

    var plot = $.plot(container, series, {
        grid: {
            borderWidth: 1,
            minBorderMargin: 20,
            labelMargin: 10,
            backgroundColor: {
                colors: ["#fff", "#e4f4f4"]
            },
            margin: {
                top: 8,
                bottom: 20,
                left: 20
            },
            markings: function(axes) {
                var markings = [];
                var xaxis = axes.xaxis;
                for (var x = Math.floor(xaxis.min); x < xaxis.max; x += xaxis.tickSize * 2) {
                    markings.push({
                        xaxis: {
                            from: x,
                            to: x + xaxis.tickSize
                        },
                        color: "rgba(232, 232, 255, 0.2)"
                    });
                }
                return markings;
            }
        },
        xaxis: {
            tickFormatter: function() {
                return "";
            }
        },
        yaxis: {
            min: 0,
            max: 110
        },
        legend: {
            show: true
        }
    });

    // Update the random dataset at 25FPS for a smoothly-animating chart
    setInterval(function updateRandom() {
        var s = getCPU();
        series[0].data = s[0];
        series[1].data = s[1];
        plot.setData(series);
        plot.draw();
    }, 1000);

});
