module.exports = {
    grades: [
        {
            letter: 'A',
            min: 86,
            max: 100
        },

        {
            letter: 'B',
            min: 73,
            max: 85
        },

        {
            letter: 'C+',
            min: 67,
            max: 72
        },

        {
            letter: 'C',
            min: 60,
            max: 66
        },

        {
            letter: 'C-',
            min: 50,
            max: 59
        },

        {
            letter: 'F',
            min: 0,
            max: 49
        }
    ],

    letterToNumeric: function(letter) {
        for (var i=0; i<this.grades.length; i++) {
            if (this.grades[i].letter == letter) {
                return this.grades[i].max;
            }
        }

        return console.error('Attempted to convert %s to numeric grade.', letter);
    },

    numericToLetter: function(number) {
        for (var i=0; i<this.grades.length; i++) {
            if (this.grades[i].min <= number && number <= this.grades[i].max) {
                return this.grades[i].letter;
            }
        }

        console.error('Attempted to convert %d to letter grade.', number);
    }
};