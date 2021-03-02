import React from 'react';
import {FlatList, ListRenderItem, StyleSheet, View} from 'react-native';
import {useSelector} from 'react-redux';
import theme from '../../../../assets/theme.style';
import {useLocale} from '../../../../hooks/useLocale';
import {
    ContestEntry,
    isContestEntry,
    Product,
    Purchase,
    purchasesSelector,
} from '../../../../redux/selectors';
import ClaimedListItem from './ClaimedListItem';
import ContestEntryListItem from './ContestEntryListItem';
import {useSafeState} from '../../../../hooks/useSafeState';
import ConfirmActivate from './ConfirmActivate';
import {trigger} from '../../../../common/utils/fp';
type props = {
    scrollEnabled: boolean;
    setScrollEnabled: (a: boolean) => void;
};
const ClaimedList = (props: props) => {
    const {t} = useLocale();
    const purchases = useSelector(purchasesSelector());
    const [popUp, setPopUp] = useSafeState<Purchase>();
    const renderDummy: ListRenderItem<Purchase | ContestEntry> = ({item}) =>
        isContestEntry(item) ? (
            <ContestEntryListItem item={item} />
        ) : (
            <ClaimedListItem
                scrollSetter={props.setScrollEnabled}
                item={item}
                onPress={setPopUp}
            />
        );

    return (
        <View style={styles.wrapper}>
            <FlatList
                scrollEnabled={props.scrollEnabled}
                contentContainerStyle={{paddingVertical: 30}}
                ItemSeparatorComponent={Separator}
                style={styles.list}
                renderItem={renderDummy}
                data={purchases}
                keyExtractor={(item) => item.id}
                // contentContainerStyle={{paddingBottom: 20}}
                // columnWrapperStyle={styles.gridRow}
            />
            <ConfirmActivate onClose={() => setPopUp()} data={popUp} />
        </View>
    );
};

const Separator = () => <View style={styles.separator} />;

const styles = StyleSheet.create({
    list: {
        flex: 1,
        // paddingTop: 50,
        paddingHorizontal: theme.padding,
    },
    header: {
        marginVertical: 40,
        color: '#ffffff',
        fontSize: 25,
        fontFamily: 'Roboto-Medium',
    },
    wrapper: {
        backgroundColor: theme.BACKGROUND_COLOR,
        flex: 1,
        flexDirection: 'column',
    },
    separator: {
        backgroundColor: '#373B4C',
        height: 1,
        marginVertical: 30,
    },
});

export default ClaimedList;
