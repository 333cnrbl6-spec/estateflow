import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Smartphone, Code, Download, CheckCircle2, AlertCircle } from 'lucide-react';

export default function MobileAppScaffold() {
  const [platform, setPlatform] = useState('ios');
  const [buildStatus, setBuildStatus] = useState('ready');

  const features = [
    { name: 'Property Management', status: 'complete', icon: '🏠' },
    { name: 'Tenant Directory', status: 'complete', icon: '👥' },
    { name: 'Maintenance Tracking', status: 'complete', icon: '🔧' },
    { name: 'Financial Dashboards', status: 'complete', icon: '💰' },
    { name: 'Push Notifications', status: 'in-progress', icon: '🔔' },
    { name: 'Offline Mode', status: 'planned', icon: '📱' },
    { name: 'Biometric Auth', status: 'planned', icon: '🔐' },
    { name: 'Camera Integration', status: 'planned', icon: '📷' }
  ];

  const buildInstructions = {
    ios: [
      { step: 1, title: 'Install React Native CLI', command: 'npm install -g react-native-cli' },
      { step: 2, title: 'Clone Repository', command: 'git clone https://github.com/premiso/mobile-app.git' },
      { step: 3, title: 'Install Dependencies', command: 'cd mobile-app && npm install' },
      { step: 4, title: 'Install Pods', command: 'cd ios && pod install && cd ..' },
      { step: 5, title: 'Start Metro', command: 'npm start' },
      { step: 6, title: 'Run on Device', command: 'npm run ios' }
    ],
    android: [
      { step: 1, title: 'Install React Native CLI', command: 'npm install -g react-native-cli' },
      { step: 2, title: 'Clone Repository', command: 'git clone https://github.com/premiso/mobile-app.git' },
      { step: 3, title: 'Install Dependencies', command: 'cd mobile-app && npm install' },
      { step: 4, title: 'Start Metro', command: 'npm start' },
      { step: 5, title: 'Run on Emulator', command: 'npm run android' }
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 flex items-center gap-2 mb-2">
            <Smartphone className="w-8 h-8 text-blue-600" />
            Mobile App Scaffold
          </h1>
          <p className="text-lg text-slate-600">React Native foundation for iOS & Android</p>
        </div>

        {/* Platform Selection */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { id: 'ios', label: '📱 iOS', device: 'iPhone' },
            { id: 'android', label: '🤖 Android', device: 'Android' },
            { id: 'web-mobile', label: '🌐 Web Mobile', device: 'Responsive' },
            { id: 'status', label: '📊 Build Status', device: 'Dashboard' }
          ].map(p => (
            <button
              key={p.id}
              onClick={() => setPlatform(p.id)}
              className={`p-4 rounded-lg border-2 transition-all text-center ${
                platform === p.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <p className="text-xl">{p.label}</p>
              <p className="text-xs text-slate-600 mt-1">{p.device}</p>
            </button>
          ))}
        </div>

        <Tabs defaultValue={platform} onValueChange={setPlatform} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="ios">iOS</TabsTrigger>
            <TabsTrigger value="android">Android</TabsTrigger>
            <TabsTrigger value="web-mobile">Web Mobile</TabsTrigger>
            <TabsTrigger value="status">Status</TabsTrigger>
          </TabsList>

          {/* iOS Build */}
          <TabsContent value="ios" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>iOS Build Instructions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {buildInstructions.ios.map(instruction => (
                    <div key={instruction.step} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                          {instruction.step}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900">{instruction.title}</p>
                          <div className="bg-slate-900 text-slate-100 p-3 rounded mt-2 font-mono text-xs overflow-x-auto">
                            {instruction.command}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Button className="w-full gap-2">
                  <Download className="w-4 h-4" />
                  Download iOS Starter Kit
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Android Build */}
          <TabsContent value="android" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Android Build Instructions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {buildInstructions.android.map(instruction => (
                    <div key={instruction.step} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                          {instruction.step}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900">{instruction.title}</p>
                          <div className="bg-slate-900 text-slate-100 p-3 rounded mt-2 font-mono text-xs overflow-x-auto">
                            {instruction.command}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Button className="w-full gap-2">
                  <Download className="w-4 h-4" />
                  Download Android Starter Kit
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Web Mobile */}
          <TabsContent value="web-mobile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Web Mobile (PWA)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-700">Use the existing responsive web app as a Progressive Web App (PWA) for mobile:</p>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    Add to Home Screen on iOS/Android
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    Offline-first caching
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    Push notifications
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    No app store submission
                  </li>
                </ul>
                <Button className="w-full gap-2">
                  <Code className="w-4 h-4" />
                  View PWA Configuration
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Build Status */}
          <TabsContent value="status" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Feature Completion Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {features.map((feature, i) => (
                    <div key={i} className="p-3 border border-slate-200 rounded-lg hover:bg-slate-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <span className="text-lg">{feature.icon}</span>
                          <div>
                            <p className="font-semibold text-slate-900">{feature.name}</p>
                          </div>
                        </div>
                        <Badge className={
                          feature.status === 'complete' ? 'bg-green-100 text-green-800' :
                          feature.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-slate-100 text-slate-800'
                        }>
                          {feature.status === 'complete' ? '✓ Complete' :
                           feature.status === 'in-progress' ? '⏳ In Progress' :
                           '📋 Planned'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-green-900">Ready for Beta</p>
                    <p className="text-sm text-green-800 mt-1">Core functionality complete. Ready for TestFlight & Google Play Beta.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Documentation */}
        <Card>
          <CardHeader>
            <CardTitle>📚 Documentation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <a href="#" className="block p-3 border border-slate-200 rounded-lg hover:bg-slate-50 text-blue-600 font-medium">
              → React Native Setup Guide
            </a>
            <a href="#" className="block p-3 border border-slate-200 rounded-lg hover:bg-slate-50 text-blue-600 font-medium">
              → API Integration Examples
            </a>
            <a href="#" className="block p-3 border border-slate-200 rounded-lg hover:bg-slate-50 text-blue-600 font-medium">
              → Architecture & Best Practices
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}