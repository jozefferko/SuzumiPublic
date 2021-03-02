import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/FontAwesome5';
import {defaultImage} from '../../../../assets/staticImages';
import theme from '../../../../assets/theme.style';
import ConfirmButton from '../../../../components/ConfirmButton';
import {useLocale} from '../../../../hooks/useLocale';
import {Product} from '../../../../redux/selectors';

type ProductsListProps = {
    item: Product;
    onPress: (a: Product) => any;
    contest?: boolean;
};

const ProductsListItem = (props: ProductsListProps) => {
    const {item, onPress} = props;
    const {t} = useLocale();
    const contest = props.contest ?? false;
    return (
        <View style={styles.wrapper}>
            <FastImage
                source={item.imgUrl ? {uri: item.imgUrl} : defaultImage}
                style={styles.productImage}
            />
            <View style={styles.labelBox}>
                <Text style={styles.title}>{t(item.displayName)}</Text>
                <Text style={styles.description}>{t(item.description)}</Text>

                <ConfirmButton
                    {...(!item.available
                        ? {
                              onPress: () => {},
                              style: {
                                  borderStyle: 'dashed',
                              },
                              outlined: true,
                              title: (
                                  <Text>
                                      <Icon
                                          name="lock"
                                          size={15}
                                          color={theme.HIGHLIGHT}
                                      />
                                      {'  '}
                                      {item.price} points
                                  </Text>
                              ),
                          }
                        : {
                              onPress: () => onPress(item),
                              title: (
                                  <Text>
                                      {t('Activate with {{price}} points', {
                                          price: item.price,
                                      })}
                                  </Text>
                              ),
                          })}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        backgroundColor: '#FFFFFF',
        flexDirection: 'column',
        borderRadius: 5,
    },
    title: {
        fontSize: 17,
        fontFamily: 'Roboto-Medium',
        color: theme.BACKGROUND_COLOR,
    },
    productImage: {
        width: '100%',
        height: 180,
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5,
        resizeMode: 'cover',
    },
    description: {
        marginTop: 12,
        marginBottom: 23,
        fontSize: 13,
        fontFamily: 'Roboto-Light',
        color: theme.BACKGROUND_COLOR,
    },
    labelBox: {
        padding: 30,
    },
    // gridRow: {
    //     justifyContent: 'space-around',
    // },
});

export default ProductsListItem;
