// Import ApexCharts if using modules
// import ApexCharts from 'apexcharts'

document.addEventListener('DOMContentLoaded', function() {
    // Sample data - Replace with actual data from your backend
    const monthlyData = [
        { month: 'Jan', revenue: 28000, orders: 145 },
        { month: 'Feb', revenue: 32000, orders: 167 },
        { month: 'Mar', revenue: 35000, orders: 178 },
        { month: 'Apr', revenue: 31000, orders: 149 },
        { month: 'May', revenue: 38000, orders: 189 },
        { month: 'Jun', revenue: 42000, orders: 208 },
    ];

    // Earnings Chart Configuration
    const earningsChartOptions = {
        series: [{
            name: 'Revenue',
            data: monthlyData.map(item => item.revenue)
        }, {
            name: 'Orders',
            data: monthlyData.map(item => item.orders)
        }],
        chart: {
            height: 350,
            type: 'line',
            toolbar: {
                show: false
            },
            zoom: {
                enabled: false
            }
        },
        colors: ['#4CAF50', '#2196F3'],
        dataLabels: {
            enabled: false
        },
        stroke: {
            curve: 'smooth',
            width: 3
        },
        grid: {
            borderColor: '#e7e7e7',
            row: {
                colors: ['#f3f3f3', 'transparent'],
                opacity: 0.5
            }
        },
        xaxis: {
            categories: monthlyData.map(item => item.month),
            labels: {
                style: {
                    colors: '#666'
                }
            }
        },
        yaxis: [
            {
                title: {
                    text: 'Revenue ($)',
                    style: {
                        color: '#4CAF50'
                    }
                },
                labels: {
                    formatter: (value) => `$${value.toLocaleString()}`
                }
            },
            {
                opposite: true,
                title: {
                    text: 'Orders',
                    style: {
                        color: '#2196F3'
                    }
                },
                labels: {
                    formatter: (value) => Math.round(value)
                }
            }
        ],
        legend: {
            position: 'top',
            horizontalAlign: 'right'
        }
    };

    // Revenue Growth Chart Configuration
    const growthChartOptions = {
        series: [{
            name: 'Growth',
            data: monthlyData.map((item, index, arr) => {
                if (index === 0) return 0;
                return (((item.revenue - arr[index - 1].revenue) / arr[index - 1].revenue) * 100).toFixed(1);
            }).slice(1)
        }],
        chart: {
            type: 'bar',
            height: 200,
            toolbar: {
                show: false
            }
        },
        plotOptions: {
            bar: {
                borderRadius: 4,
                horizontal: false,
            }
        },
        colors: ['#FF9800'],
        xaxis: {
            categories: monthlyData.map(item => item.month).slice(1),
        },
        yaxis: {
            title: {
                text: 'Growth (%)'
            },
            labels: {
                formatter: (value) => `${value}%`
            }
        },
        tooltip: {
            y: {
                formatter: (value) => `${value}%`
            }
        }
    };

    // Total Orders Gauge Chart Configuration
    const orderGaugeOptions = {
        series: [84],
        chart: {
            type: 'radialBar',
            height: 200,
            sparkline: {
                enabled: true
            }
        },
        plotOptions: {
            radialBar: {
                startAngle: -90,
                endAngle: 90,
                track: {
                    background: "#e7e7e7",
                    strokeWidth: '97%',
                    margin: 5
                },
                dataLabels: {
                    name: {
                        show: false
                    },
                    value: {
                        offsetY: -2,
                        fontSize: '22px'
                    }
                }
            }
        },
        grid: {
            padding: {
                top: -10
            }
        },
        colors: ['#2196F3'],
        labels: ['Orders Complete']
    };

    // Initialize Charts
    if (document.querySelector('#earningsChart')) {
        const earningsChart = new ApexCharts(
            document.querySelector('#earningsChart'), 
            earningsChartOptions
        );
        earningsChart.render();
    }

    if (document.querySelector('.totalGrowth')) {
        const growthChart = new ApexCharts(
            document.querySelector('.totalGrowth'), 
            growthChartOptions
        );
        growthChart.render();
    }

    if (document.querySelector('.totalOrder')) {
        const orderGauge = new ApexCharts(
            document.querySelector('.totalOrder'), 
            orderGaugeOptions
        );
        orderGauge.render();
    }

    // Helper function to format currency
    function formatCurrency(value) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(value);
    }
});