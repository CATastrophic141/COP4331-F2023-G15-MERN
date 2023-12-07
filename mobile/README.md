# geosnap

A new Flutter project.

## Getting Started

This project is a starting point for a Flutter application.

A few resources to get you started if this is your first Flutter project:

- [Lab: Write your first Flutter app](https://docs.flutter.dev/get-started/codelab)
- [Cookbook: Useful Flutter samples](https://docs.flutter.dev/cookbook)

For help getting started with Flutter development, view the
[online documentation](https://docs.flutter.dev/), which offers tutorials,
samples, guidance on mobile development, and a full API reference.

Note about ```phone_number``` package when building:

Only works with android and iOS

Uncomment package in pubspec.yaml when building mobile app

iOS specific: Add the following line to the top of the Runner target in your ```ios/Podfile```

```
target 'Runner' do
pod 'PhoneNumberKit/PhoneNumberKitCore', :git => 'https://github.com/marmelroy/PhoneNumberKit', :tag => '3.5.10'
...
end
```