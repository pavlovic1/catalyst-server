const express = require('express');
const cors = require('cors');
const OCL = require('openchemlib');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Catalyst Branding Colors
const COLORS = {
    CARBON: '#4ade80',
    OXYGEN: '#f87171',
    NITROGEN: '#60a5fa',
    BONDS: '#334155',
    TEXT: '#0f172a'
};

app.get('/render', (req, res) => {
    const smiles = req.query.smiles ? req.query.smiles.trim() : null;
    if (!smiles) return res.status(400).send('Missing SMILES');

    console.log(`[${new Date().toLocaleTimeString()}] Rendering: "${smiles}"`);

    try {
        const molecule = OCL.Molecule.fromSmiles(smiles);
        molecule.isFragment(false);
        
        /**
         * SKELETAL FORMULA CONFIGURATION:
         * - noImplicitHydrogens: false (Shows -OH, -NH2 labels on heteroatoms)
         * - showTerminals: false (Hides -CH3 labels at the end of lines, crucial for skeletal form)
         * - atomSize: 10 (Clear labeling for heteroatoms)
         * - strokeWidth: 2px (Requested)
         */
        let svg = molecule.toSVG(100, 100, '', {
            noAtomColor: false,
            noImplicitHydrogens: false, 
            showTerminals: false, 
            fontWeight: 'bold',
            strokeWidth: '2px',
            atomSize: 10,
            bondLength: 25
        });

        // Apply Catalyst Colors
        svg = svg.replace(/stroke="#000000"/g, `stroke="${COLORS.BONDS}"`);
        svg = svg.replace(/fill="#000000"/g, `fill="${COLORS.TEXT}"`);
        svg = svg.replace(/fill="#FF0000"/g, `fill="${COLORS.OXYGEN}"`);
        svg = svg.replace(/stroke="#FF0000"/g, `stroke="${COLORS.OXYGEN}"`);
        svg = svg.replace(/fill="#0000FF"/g, `fill="${COLORS.NITROGEN}"`);
        svg = svg.replace(/stroke="#0000FF"/g, `stroke="${COLORS.NITROGEN}"`);

        // Force Responsive & Remove Background
        svg = svg.replace('width="100" height="100"', 'width="100%" height="100%"');
        svg = svg.replace('<rect width="100" height="100" fill="#FFFFFF"/>', '');

        res.set('Content-Type', 'image/svg+xml');
        res.send(svg);
        console.log(`✔ Skeletal Formula Success: ${smiles}`);
    } catch (error) {
        console.error("Rendering Error:", error);
        res.status(500).send('Error');
    }
});

app.listen(port, '0.0.0.0', () => {
    console.log(`✔ Catalyst Pro Renderer LIVE at http://192.168.88.141:${port}`);
});