import React from 'react';
import {
    Platform,
    Pressable,
    SafeAreaView,
    StyleSheet,
    View,
} from 'react-native';
import Modal from 'react-native-modal';
import theme from '../assets/theme.style';

// const deviceWidth = Dimensions.get('window').width;
// const deviceHeight =
//     Platform.OS === 'ios'
//         ? Dimensions.get('window').height
//         : require('react-native-extra-dimensions-android').get(
//               'REAL_WINDOW_HEIGHT',
//           );
type props = {
    show: boolean;
    onClose: () => any;
    children: React.ReactNode;
    height?: number | string;
};

const CustomModal = (props: props) => {
    return (
        <Modal
            // deviceWidth={deviceWidth}
            // deviceHeight={deviceHeight}
            propagateSwipe
            backdropTransitionOutTiming={0}
            isVisible={props.show}
            onSwipeComplete={() => props.onClose()}
            swipeDirection="down"
            onBackdropPress={() => props.onClose()}
            style={{justifyContent: 'flex-end', margin: 0}}>
            <Pressable
                onPress={() => props.onClose()}
                style={styles.handleArea}>
                <View style={styles.handleBar} />
            </Pressable>
            <SafeAreaView style={[styles.container, {height: props.height}]}>
                <View style={[styles.content, props.height ? {flex: 1} : {}]}>
                    {props.children}
                </View>
            </SafeAreaView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    handleArea: {
        // width:100%,
        height: 80,
        justifyContent: 'flex-end',
    },
    handleBar: {
        width: 80,
        height: 5,
        borderRadius: 100,
        backgroundColor: '#FFFFFF',
        alignSelf: 'center',
        marginBottom: 5,
    },
    container: {
        backgroundColor: theme.BACKGROUND_COLOR,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        // height: '90%',
    },
    content: {
        paddingTop: 22,
        paddingBottom: Platform.OS === 'android' ? 22 : 0,
        paddingHorizontal: 22,
        // flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    contentTitle: {
        fontSize: 20,
        marginBottom: 12,
    },
});

export default CustomModal;
