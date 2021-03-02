import React from 'react';
import {
    Pressable,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import {
    Colors,
    DebugInstructions,
    Header,
    LearnMoreLinks,
    ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

const HelloWorld = () => {
    return (
        <>
            <StatusBar barStyle="light-content" />
            <SafeAreaView>
                <ScrollView
                    contentInsetAdjustmentBehavior="automatic"
                    style={styles.scrollView}>
                    <Header />
                    <View style={styles.body}>
                        {/* eslint-disable-next-line react/jsx-no-undef */}
                        <Pressable onPress={() => console.log('e')}>
                            <View
                                style={{
                                    width: 200,
                                    height: 200,
                                    backgroundColor: 'red',
                                }}>
                                <Text>LONG ANIMATION</Text>
                            </View>
                        </Pressable>
                        <View style={styles.sectionContainer}>
                            <Text style={styles.sectionTitle}>Step One</Text>
                            <Text style={styles.sectionDescription}>
                                Edit{' '}
                                <Text style={styles.highlight}>App.tsx</Text> to
                                change this screen and then come back to see
                                your edits.
                            </Text>
                        </View>
                        <View style={styles.sectionContainer}>
                            <Text style={styles.sectionTitle}>
                                See Your Changes
                            </Text>
                            <Text style={styles.sectionDescription}>
                                <ReloadInstructions />
                            </Text>
                        </View>
                        <View style={styles.sectionContainer}>
                            <Text style={styles.sectionTitle}>Debug</Text>
                            <Text style={styles.sectionDescription}>
                                <DebugInstructions />
                            </Text>
                        </View>
                        <View style={styles.sectionContainer}>
                            <Text style={styles.sectionTitle}>Learn More</Text>
                            <Text style={styles.sectionDescription}>
                                Read the docs to discover what to do next:
                            </Text>
                        </View>
                        <LearnMoreLinks />
                    </View>
                </ScrollView>
            </SafeAreaView>
        </>
    );
};

const styles = StyleSheet.create({
    scrollView: {
        backgroundColor: Colors.lighter,
    },
    engine: {
        position: 'absolute',
        right: 0,
    },
    body: {
        backgroundColor: Colors.white,
    },
    sectionContainer: {
        marginTop: 32,
        paddingHorizontal: 24,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: '600',
        color: Colors.black,
    },
    sectionDescription: {
        marginTop: 8,
        fontSize: 18,
        fontWeight: '400',
        color: Colors.dark,
    },
    highlight: {
        fontWeight: '700',
    },
    footer: {
        color: Colors.dark,
        fontSize: 12,
        fontWeight: '600',
        padding: 4,
        paddingRight: 12,
        textAlign: 'right',
    },
});

export default HelloWorld;
