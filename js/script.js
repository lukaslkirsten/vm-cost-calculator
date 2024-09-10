let csvData;

function loadData() {
  fetch("data\\TestBase.csv")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Erro ao carregar arquivo .csv");
      }
      return response.text();
    })

    .then((data) => {
      csvData = csvToArray(data);
    })
    .catch((error) => console.error("Erro:", error));
}

function csvToArray(str) {
  const rows = str.split("\n");
  const headers = rows[0].split(",").map((h) => h.trim());

  return rows.slice(1).map((row) => {
    const regex = /"(.*?)"/g;
    const rowFix = row.replace(regex, (x, y) => {
      const modifiedText = y.replace(",", ".");
      return modifiedText;
    });

    const values = rowFix.split(",");
    return headers.reduce((object, header, index) => {
      object[header] = values[index]?.trim();
      return object;
    }, {});
  });
}

window.onload = loadData;

function getCsvData() {
  return csvData === undefined ? console.log("Dados não carregados.") : csvData;
}

document.getElementById("vm-form").addEventListener("submit", function (e) {
  e.preventDefault();

  const ram = parseInt(document.getElementById("ram").value);
  const vcpu = parseInt(document.getElementById("vcpu").value);
  const sisOpe = document.getElementById("os").value;

  const errorNotFound = document.getElementById("error-not-found");

  const textPrecoMedio = document.getElementById("vm-preco-medio");

  const divResults = document.getElementById("results");

  const minContainer = document.getElementById("menor-preco-container");
  const divMenorPreco = document.getElementById("div-vm-menor-preco");
  const divMaiorPreco = document.getElementById("div-vm-maior-preco");

  const data = getCsvData();

  const validVcpu = [1, 2, 4, 8, 16, 32, 64];

  if (!validVcpu.includes(vcpu)) {
    alert(
      "Por favor, insira um número de vCPU válido: 1, 2, 4, 8, 16, 32, 64."
    );
    throw new Error("Número de vCPU inválido");
  }

  const vmsFilter = data.filter(
    (vm) =>
      parseInt(vm.memoryInMB / 1000) == ram &&
      vm.numberOfCores == vcpu &&
      vm.os === sisOpe
  );

  if (vmsFilter.length === 0) {
    minContainer.innerHTML = "";
    textPrecoMedio.innerText = "";
    divMenorPreco.innerHTML = '';
    divMaiorPreco.innerHTML = '';
    
    divResults.style.display = 'none';
    errorNotFound.style.removeProperty('display');
    
    errorNotFound.innerText = `Nenhum VM com essas características foi encontrada.`;
    throw new Error("Nenhum VM encontrado.");
  } else {
    minContainer.innerHTML = "";
    errorNotFound.innerText = "";
    
    errorNotFound.style.display = 'none';
    divResults.style.removeProperty('display');
  }

  const vmsMinPrice = vmsFilter?.reduce((min, vm) => {
    return vm.unitPricePerUnit < min.unitPricePerUnit ? vm : min;
  }, vmsFilter[0]);

  const vmsMaxPrice = vmsFilter?.reduce((max, vm) => {
    return vm.unitPricePerUnit > max.unitPricePerUnit ? vm : max;
  }, vmsFilter[0]);

  const vmsMediumPrice =
    vmsFilter?.reduce((sum, vm) => sum + parseFloat(vm.unitPricePerUnit), 0) /
    vmsFilter.length;

  if (divMenorPreco) {
    divMenorPreco.innerHTML = `
                <div><h2>${vmsMinPrice.meterName}</h2><p>Menor preço</p></div>
                <p><strong>RAM:</strong> ${vmsMinPrice.memoryInMB}</p>
                <p><strong>vCPU:</strong> ${vmsMinPrice.numberOfCores}</p>
                <p><strong>Price:</strong> ${vmsMinPrice.unitPricePerUnit}</p>
            `;
  }

  if (divMaiorPreco) {
    divMaiorPreco.innerHTML = `
                <div><h2>${vmsMaxPrice.meterName}</h2><p>Maior preço</p></div>
                <p><strong>RAM:</strong> ${vmsMaxPrice.memoryInMB}</p>
                <p><strong>vCPU:</strong> ${vmsMaxPrice.numberOfCores}</p>
                <p><strong>Price:</strong> ${vmsMaxPrice.unitPricePerUnit}</p>
            `;
  }

  textPrecoMedio.innerText = `Preço médio: ${vmsMediumPrice?.toFixed(5)}`;
  
  if (minContainer) {
    minContainer.innerHTML = `
                <h3>Mais VMs com o menor preço:</h3>
            `;
  }

  vmsFilter.forEach((vmMin) => {
    if (vmMin.unitPricePerUnit == vmsMinPrice.unitPricePerUnit) {
      const divMinPrice = document.createElement("div");
      divMinPrice.classList.add("todos-menor-preco");

      divMinPrice.innerHTML = `
              <h2>${vmMin.meterName}</h2>
              <p><strong>RAM:</strong> ${vmMin.memoryInMB}</p>
              <p><strong>vCPU:</strong> ${vmMin.numberOfCores}</p>
              <p><strong>Price:</strong> ${vmMin.unitPricePerUnit}</p>
          `;

      minContainer.appendChild(divMinPrice);
    }
  });
});
