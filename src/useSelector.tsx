import state from "./mockDocument.json";
import {IApplicationState} from "./SharedDataModels";

function useSelector(selector: (state: IApplicationState) => any) {
    return selector(state as IApplicationState);
}

export default useSelector;