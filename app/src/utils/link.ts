import {Linking, Platform} from 'react-native';
import InAppBrowser from 'react-native-inappbrowser-reborn';
import theme from '../assets/theme.style';

const applistingUrl = () =>
    Platform.OS === 'ios' ? 'https://www.apple.com' : 'https://www.google.com';

export const openLink = (url: string) => {
    Linking.canOpenURL(url).then((supported) => {
        if (supported) {
            Linking.openURL(url);
        } else {
            console.log(`Don't know how to open URI: ${url}`);
        }
    });
};

export const appendHTTP = (s: string): string =>
    s.startsWith('http') ? s : 'http://' + s;
export const openLinkInApp = async (url: string) => {
    if (await InAppBrowser.isAvailable()) {
        const result = await InAppBrowser.open(appendHTTP(url), {
            // iOS Properties
            dismissButtonStyle: 'close',
            preferredBarTintColor: '#272d49', //theme.BACKGROUND_COLOR,
            preferredControlTintColor: 'white',
            readerMode: false,
            animated: false,
            modalPresentationStyle: 'fullScreen',
            modalEnabled: false,
            enableBarCollapsing: true,
            // Android Properties
            showTitle: true,
            toolbarColor: theme.BACKGROUND_COLOR,
            secondaryToolbarColor: 'black',
            enableUrlBarHiding: true,
            enableDefaultShare: true,
            forceCloseOnRedirection: false,
            // Specify full animation resource identifier(package:anim/name)
            // or only resource name(in case of animation bundled with app).
            animations: {
                startEnter: 'slide_in_right',
                startExit: 'slide_out_left',
                endEnter: 'slide_in_left',
                endExit: 'slide_out_right',
            },
        });
        console.log(JSON.stringify(result));
    } else {
        openLink(appendHTTP(url));
    }
};
