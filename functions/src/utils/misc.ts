import {
    FSRestaurant,
    FSTierExpiry,
    FSTimestamp,
} from "../common/types/firestore";
import { serverTimestamp } from "../common/utils/firestore/normalize";
import { addToTimestamp, currentDay } from "../common/utils/dateOperations";

export const calculateTierExpiry = (
    tier: number,
    restaurant: FSRestaurant,
    startFrom?: FSTimestamp
): Partial<FSTierExpiry> =>
    restaurant.tiers.tiers[tier].expire
        ? {
              expires: true,
              amountToMaintain: restaurant.tiers.tiers[tier].maintainPoints,
              start: startFrom ?? serverTimestamp(),
              end: startFrom
                  ? addToTimestamp({ months: restaurant.tiers.expiryPeriod })(
                        startFrom
                    )
                  : currentDay(restaurant.tiers.expiryPeriod),
          }
        : { expires: false };
