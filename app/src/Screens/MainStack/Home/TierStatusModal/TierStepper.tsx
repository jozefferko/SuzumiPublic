import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {SvgXml} from 'react-native-svg';
import {getSushiSVG} from '../../../../assets/svgs';
import theme from '../../../../assets/theme.style';
import {FSTier} from '../../../../common/types/firestore';
import {trigger} from '../../../../common/utils/fp';
import {useLocale} from '../../../../hooks/useLocale';
import {scaleHorizontal} from '../../../../utils/scale';

type StepProps = {
    index: number;
    currentIndex: number;
    tier: FSTier;
    onPress: (id: number) => any;
};
const iconWidth = scaleHorizontal(61);
const TierStepperStep = (props: StepProps) => {
    const {t} = useLocale();
    return (
        <View
            // contentContainerStyle={{
            //     justifyContent: 'space-evenly',
            //     alignItems: 'center',
            //     flex: 1,
            // }}
            style={styles.stepContainer}>
            <Pressable onPress={trigger(props.onPress)(props.index)}>
                <SvgXml
                    style={{
                        opacity: props.index <= props.currentIndex ? 1 : 0.5,
                    }}
                    xml={getSushiSVG(
                        props.tier.color,
                        props.currentIndex === props.index,
                    )}
                    height={scaleHorizontal(52)}
                    width={iconWidth}
                    preserveAspectRatio="xMidYMid meet"
                />
            </Pressable>
            <Text
                style={[
                    styles.tierLabel,
                    {
                        color:
                            props.index === props.currentIndex
                                ? props.tier.color
                                : '#999999',
                        opacity: props.index <= props.currentIndex ? 1 : 0.5,
                    },
                ]}>
                {t(props.tier.displayName)}
            </Text>
            <View
                style={
                    props.index === props.currentIndex
                        ? [
                              styles.circleCurrent,
                              {backgroundColor: props.tier.color},
                          ]
                        : props.index > props.currentIndex
                        ? styles.circlePrev
                        : styles.circleNext
                }
            />

            <View
                style={[
                    styles.triangle,
                    {opacity: props.index === props.currentIndex ? 1 : 0},
                ]}
            />
        </View>
    );
};

type ProgressProps = {
    currentIndex: number;
    index: number;
};
const ProgressBarSection = (props: ProgressProps) => (
    <View
        style={{
            flex: 1,
            height: 1,
            backgroundColor:
                props.currentIndex >= props.index ? '#FFFFFF' : '#585D72',
        }}
    />
);

type props = {
    tiers: FSTier[];
    currentTier: number;
    onPress: (id: number) => any;
};
// const currentStep = 1;
const TierStepper = (props: props) => {
    return (
        <View style={styles.container}>
            <View style={styles.progressBar}>
                <View style={styles.progressBarContent}>
                    {props.tiers.map((tier, index) =>
                        index === 0 ? null : (
                            <ProgressBarSection
                                key={index}
                                currentIndex={props.currentTier}
                                index={index}
                            />
                        ),
                    )}
                </View>
            </View>
            <View style={styles.steps}>
                {}
                {/*<TierStepperStep*/}
                {/*    ={1}*/}
                {/*    id={0}*/}
                {/*    currentStep={currentStep}*/}
                {/*    tier={dummyStep}*/}
                {/*/>*/}
                {props.tiers.map((tier, index) => (
                    <TierStepperStep
                        key={index}
                        index={index}
                        currentIndex={props.currentTier}
                        tier={tier}
                        onPress={props.onPress}
                    />
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        // backgroundColor: '#F0F',
    },
    steps: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    progressBar: {
        width: '100%',
        bottom: 0,
        position: 'absolute',

        marginBottom: 58,
    },
    progressBarContent: {
        flexDirection: 'row',
        height: 1,
        backgroundColor: '#FF0',
        marginHorizontal: iconWidth / 2,
    },
    stepContainer: {
        alignItems: 'center',
    },
    tierLabel: {
        fontSize: 11,
        marginVertical: 10,
        fontFamily: 'Roboto-Light',
        textTransform: 'capitalize',
    },
    circleCurrent: {
        width: 12,
        height: 12,
        borderRadius: 12 / 2,
        backgroundColor: '#F0F',
    },
    circlePrev: {
        margin: 2,
        width: 8,
        height: 8,
        borderRadius: 8 / 2,
        backgroundColor: '#585D72',
    },
    circleNext: {
        margin: 2,
        width: 8,
        height: 8,
        borderRadius: 8 / 2,
        borderWidth: 2,
        borderColor: '#FFFFFF',
        backgroundColor: theme.BACKGROUND_COLOR,
    },
    triangle: {
        marginTop: 30,
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftWidth: 12,
        borderRightWidth: 12,
        borderBottomWidth: 23,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: 'white',
    },
});

export default TierStepper;
