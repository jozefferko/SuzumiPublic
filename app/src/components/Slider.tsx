import React, {useRef, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import Swiper from 'react-native-swiper';
import ConfirmButton from './ConfirmButton';
import {Condition} from './logicalLib';

// const deviceWidth = Dimensions.get('window').width;
// const deviceHeight =
//     Platform.OS === 'ios'
//         ? Dimensions.get('window').height
//         : require('react-native-extra-dimensions-android').get(
//               'REAL_WINDOW_HEIGHT',
//           );
type props = {
    onFinish: () => any;
    children: React.ReactElement[];
};

const Slider = (props: props) => {
    const [currentChild, setCurrentChild] = useState(0);
    const sliderRef = useRef<any>();
    return (
        <View>
            <Swiper
                dotColor="#80838E"
                activeDotColor="#FFFFFF"
                loop={false}
                ref={sliderRef}
                index={0}
                onIndexChanged={setCurrentChild}>
                {props.children}
            </Swiper>
            <Condition if={props.children.length - 1 === currentChild}>
                <ConfirmButton
                    style={styles.button}
                    onPress={props.onFinish}
                    title="Confirm"
                />
                <ConfirmButton
                    style={styles.button}
                    onPress={() => {
                        sliderRef.current?.scrollBy(1, true);
                        setCurrentChild(($) => $ + 1);
                    }}
                    title="Next"
                />
            </Condition>
        </View>
    );
};

const styles = StyleSheet.create({
    button: {
        marginTop: 15,
    },
});

export default Slider;
