import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import {
    GridRowModes,
    DataGrid,
    GridToolbarContainer,
    GridActionsCellItem,
} from '@mui/x-data-grid';

// Başlangıç satırları (örnek veri)
const initialRows = [
    { id: 1, productCode: '', productName: '', price: 0 },
];

function EditToolbar(props) {
    const { setRows, setRowModesModel, nextId, setNextId } = props;

    // Yeni satır ekleme fonksiyonu
    const handleClick = () => {
        setRows((oldRows) => [
            ...oldRows,
            { id: nextId, productCode: '', productName: '', price: 0, isNew: true }, // Yeni satır eklenirken id, nextId ile atanıyor
        ]);
        setRowModesModel((oldModel) => ({
            ...oldModel,
            [nextId]: { mode: GridRowModes.Edit, fieldToFocus: 'productCode' }, // Yeni satır düzenleme moduna geçer
        }));
        setNextId((prevId) => prevId + 1); // nextId'yi bir artır
    };

    return (
        <GridToolbarContainer>
            <Button color="primary" startIcon={<AddIcon />} onClick={handleClick}>
                Add record
            </Button>
        </GridToolbarContainer>
    );
}

export default function ProductGrid() {
    const [rows, setRows] = React.useState(initialRows); // Satır verilerini saklayan state
    const [rowModesModel, setRowModesModel] = React.useState({}); // Satır modları (edit/view)
    const [nextId, setNextId] = React.useState(2); // Bir sonraki satırın id'sini tutan state (başlangıçta 2)

    // Ürün bilgilerini getiren fonksiyon (özel fonksiyon)
    const getProductInfo = (productCode) => {
        const productData = {
            '123': { productName: 'Ürün 123', price: 100 },
            '456': { productName: 'Ürün 456', price: 200 },
        };
        return productData[productCode] || null; // Ürün koduna göre ürün verisi döndür
    };

    // Satır güncelleme fonksiyonu (DataGrid'e ait)
    const processRowUpdate = (newRow) => {
        // Eğer ürün kodu girildiyse ürün bilgilerini getir
        if (newRow.productCode) {
            const productInfo = getProductInfo(newRow.productCode);
            if (productInfo) {
                newRow.productName = productInfo.productName;
                newRow.price = productInfo.price;
            } else {
                newRow.productName = 'Bilinmiyor';
                newRow.price = 0;
            }
        }

        // Satırı güncelle
        setRows((oldRows) =>
            oldRows.map((row) => (row.id === newRow.id ? newRow : row))
        );

        // Eğer ürün kodu girildiyse yeni bir boş satır ekle
        if (newRow.productCode) {
            setRows((oldRows) => [
                ...oldRows,
                { id: nextId, productCode: '', productName: '', price: 0, isNew: true }, // Yeni satıra sıralı bir id veriliyor
            ]);
            setRowModesModel((oldModel) => ({
                ...oldModel,
                [nextId]: { mode: GridRowModes.Edit, fieldToFocus: 'productCode' }, // Yeni satırı düzenleme moduna geçir
            }));
            setNextId(nextId + 1); // Sonraki satır için id'yi bir artır
        }

        return newRow;
    };

    // Satır modlarını değiştiren fonksiyon (DataGrid'e ait)
    const handleRowModesModelChange = (newRowModesModel) => {
        setRowModesModel(newRowModesModel); // Satır modlarını güncelle
    };

    // Satır silindiğinde id'leri yeniden sıralayan fonksiyon
    const handleDeleteRow = (idToDelete) => {
        setRows((oldRows) => {
            // Satırı sil
            const newRows = oldRows.filter((row) => row.id !== idToDelete);

            // Geriye kalan satırların id'lerini 1'den başlayarak yeniden sırala
            const updatedRows = newRows.map((row, index) => ({
                ...row,
                id: index + 1, // Yeni id sıralaması
            }));

            setNextId(updatedRows.length + 1); // nextId'yi güncelle
            return updatedRows;
        });
    };

    // DataGrid sütunları
    const columns = [
        { field: 'id', headerName: 'ID', width: 80 }, // Satır id'sini gösteren sütun
        { field: 'productCode', headerName: 'Product Code', width: 180, editable: true }, // Ürün kodu düzenlenebilir
        { field: 'productName', headerName: 'Product Name', width: 180 }, // Ürün adı
        { field: 'price', headerName: 'Price', width: 100 }, // Ürün fiyatı
        {
            field: 'actions',
            type: 'actions', // DataGrid'e ait aksiyon sütunu
            headerName: 'Actions',
            width: 100,
            getActions: ({ id }) => {
                const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

                if (isInEditMode) {
                    return [
                        <GridActionsCellItem
                            icon={<SaveIcon />}
                            label="Save"
                            sx={{ color: 'primary.main' }}
                            onClick={() => setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } })} // Kaydet
                        />,
                        <GridActionsCellItem
                            icon={<CancelIcon />}
                            label="Cancel"
                            onClick={() => setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View, ignoreModifications: true } })} // İptal
                        />,
                    ];
                }
                return [
                    <GridActionsCellItem
                        icon={<EditIcon />}
                        label="Edit"
                        onClick={() => setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } })} // Düzenle
                    />,
                    <GridActionsCellItem
                        icon={<DeleteIcon />}
                        label="Delete"
                        onClick={() => handleDeleteRow(id)} // Satırı sil
                    />,
                ];
            },
        },
    ];

    return (
        <Box sx={{ height: 500, width: '100%' }}>
            <DataGrid
                rows={rows} // Tablo satırları
                columns={columns} // Tablo sütunları
                editMode="row" // Satır düzenleme modu
                rowModesModel={rowModesModel} // Satır modları
                onRowModesModelChange={handleRowModesModelChange} // Satır modları değişimi
                processRowUpdate={processRowUpdate} // Satır güncelleme
                slots={{ toolbar: EditToolbar }} // Araç çubuğu
                slotProps={{ toolbar: { setRows, setRowModesModel, nextId, setNextId } }} // Araç çubuğu özellikleri
            />
        </Box>
    );
}
