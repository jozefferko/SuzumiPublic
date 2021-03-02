import {FSProduct} from '../../types/firestore';
import {OrderedDocDeleter} from './orderedCollection';
import {fsFieldValue} from './queries';
import {FieldValue} from '../../../commonDefs/definitions';

export const deleteProduct: OrderedDocDeleter<FSProduct> = (transaction, doc) =>
    transaction
        .update(doc)({
            flags: fsFieldValue(FieldValue.arrayRemove('active')),
        })
        .update(doc)({
        flags: fsFieldValue(FieldValue.arrayUnion('delete')),
    });
