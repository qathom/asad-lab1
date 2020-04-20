export class CellUtils {

    public static COLOR_MULTIPLIER : number = 2;
    public static ODD_EVEN_MULTIPLIER : number = 2;
    public static CELL_MULTIPLIER : number = 36;

    /**
     * Check if the cell is red
     * @param cell Cell Id
     * @return Boolean isRed
     */
    static isRed(cell:number):boolean{
        const redCells : Array<number> = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];
        return redCells.includes(cell) //isRed
    }
}