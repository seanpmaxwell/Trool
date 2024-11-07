
class Patron {

  public firstName = '';
  public lastName = '';
  public isVip = false;
  public isFlagged = false;

  /**
   * Constructor()
   */
  public constructor(
    firstName = '',
    lastName = '',
    isVip = false,
    isFlagged = false,
  ) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.isVip = isVip;
    this.isFlagged = isFlagged;
  }

  /**
   * Ticket to string
   */
  public toString(): string {
    return `Full Name: ${this.firstName} ${this.lastName} | ` +
      `VIP Status: ${this.isVip} | ` +
      `Allow Entry: ${!this.isFlagged}`;
  }

  /**
   * Check last-name
   */
  public checkLastName(val: string): boolean {
    return (this.lastName.toLowerCase().includes(val.toLowerCase()));
  }
}


// **** Export default **** //

export default Patron;
