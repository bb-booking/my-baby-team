#import <Foundation/Foundation.h>
#import <Capacitor/Capacitor.h>

CAP_PLUGIN(LiveActivityPlugin, "LiveActivity",
    CAP_PLUGIN_METHOD(startSleepActivity, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(endSleepActivity, CAPPluginReturnPromise);
)
