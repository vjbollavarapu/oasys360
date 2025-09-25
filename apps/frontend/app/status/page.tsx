import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'System Status - OASYS',
  description: 'Real-time status of OASYS services, uptime, and performance metrics.',
}

export default function StatusPage() {
  const services = [
    {
      name: "API Services",
      status: "operational",
      uptime: "99.9%",
      responseTime: "120ms"
    },
    {
      name: "AI Processing",
      status: "operational", 
      uptime: "99.8%",
      responseTime: "2.3s"
    },
    {
      name: "Blockchain Network",
      status: "operational",
      uptime: "99.9%",
      responseTime: "850ms"
    },
    {
      name: "Document Processing",
      status: "operational",
      uptime: "99.7%",
      responseTime: "1.8s"
    },
    {
      name: "Authentication",
      status: "operational",
      uptime: "99.9%",
      responseTime: "95ms"
    },
    {
      name: "Database",
      status: "operational",
      uptime: "99.9%",
      responseTime: "45ms"
    }
  ]

  const recentIncidents = [
    {
      title: "Scheduled Maintenance - API Services",
      date: "2024-01-15",
      status: "resolved",
      description: "Planned maintenance window for API infrastructure updates."
    },
    {
      title: "AI Processing Delay",
      date: "2024-01-10",
      status: "resolved", 
      description: "Temporary delays in AI document processing due to high load."
    },
    {
      title: "Blockchain Network Sync Issue",
      date: "2024-01-05",
      status: "resolved",
      description: "Brief synchronization delay with blockchain networks."
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              System <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Status</span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Real-time status and performance metrics for all OASYS services.
            </p>
          </div>

          <div className="mb-12">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">All Systems Operational</h2>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-600 font-semibold">All services running normally</span>
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-green-600 mb-2">99.9%</div>
                  <div className="text-gray-600">Overall Uptime</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-blue-600 mb-2">0</div>
                  <div className="text-gray-600">Active Incidents</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-purple-600 mb-2">24/7</div>
                  <div className="text-gray-600">Monitoring</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Service Status</h2>
            <div className="space-y-4">
              {services.map((service, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full ${
                        service.status === 'operational' ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{service.name}</h3>
                        <div className="flex gap-6 text-sm text-gray-600">
                          <span>Uptime: {service.uptime}</span>
                          <span>Response: {service.responseTime}</span>
                        </div>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      service.status === 'operational' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {service.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Recent Incidents</h2>
            <div className="space-y-4">
              {recentIncidents.map((incident, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{incident.title}</h3>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          incident.status === 'resolved' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {incident.status}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-2">{incident.description}</p>
                      <span className="text-sm text-gray-500">{incident.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Performance Metrics</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Last 30 Days</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Average Response Time</span>
                    <span className="font-semibold text-gray-900">156ms</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Success Rate</span>
                    <span className="font-semibold text-green-600">99.8%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Requests</span>
                    <span className="font-semibold text-gray-900">2.4M</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">SLA Status</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">API Uptime SLA</span>
                    <span className="font-semibold text-green-600">99.9% ✓</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Response Time SLA</span>
                    <span className="font-semibold text-green-600">&lt; 200ms ✓</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Error Rate SLA</span>
                    <span className="font-semibold text-green-600">&lt; 0.1% ✓</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}