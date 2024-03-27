import searchGroup from "./search-group.js";
import selectGroupIfItExists from "./select-group-if-it-exists.js";

export default async (name) => {
    await searchGroup(name)
    return await selectGroupIfItExists(name)
}
