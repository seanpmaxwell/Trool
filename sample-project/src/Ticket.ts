/**
 * Ticket class.
 *
 * created by Sean Maxwell Mar 2, 2019
 */


type ticketOpts = 'Regular' | 'Seasonal';

class Ticket {

    public basePrice: number;
    public option: ticketOpts;
    public eventDate: Date;


    constructor(option: ticketOpts, eventDate: Date, basePrice: number) {
        this.basePrice = basePrice;
        this.eventDate = eventDate;
        this.option = option;
    }


    // Base on Regular or Seasonal
    public setBasePrice(basePrice: number): void {
        this.basePrice = basePrice;
    }


    // Update the basePrice based on time till event
    // Price will increase as times goes on
    public addToBasePrice(toAdd: number): void {
        this.basePrice += toAdd;
    }
}

export default Ticket;
