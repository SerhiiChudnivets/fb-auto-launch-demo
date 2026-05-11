import { useCallback as e, useMemo as t, useState as n } from "react";
import { jsx as r, jsxs as i } from "react/jsx-runtime";
//#region src/components/DynamicForm/DynamicForm.tsx
function a(e) {
	return e.value_type === "BOOLEAN" ? !1 : e.value_type === "ARRAY" ? [] : (e.value_type === "INTEGER" || e.value_type === "BIGINT" || e.value_type === "FLOAT" || e.value_type, "");
}
function o(e) {
	return e && typeof e == "object" && "id" in e ? e.id : e;
}
function s(e, t, n, r) {
	if (!e.options) return null;
	if (!e.depend_on) return e.options;
	let i = t.find((t) => t.name === e.depend_on);
	if (!i) return e.options;
	let a = n[e.depend_on] ?? r?.[e.depend_on];
	if (a === void 0 || a === "" || a === null) return [];
	let s = i.options?.find((e) => {
		let t = o(e.value);
		return String(t) === String(a);
	});
	if (!s) return [];
	let c = o(s.value);
	return e.options.filter((t) => {
		if (!t.value || typeof t.value != "object") return !0;
		let n = t.value, r = `${e.depend_on}_id`;
		if (r in n) return String(n[r]) === String(c);
		for (let e of Object.keys(n)) {
			if (e.endsWith("_ids") && Array.isArray(n[e])) return n[e].map(String).includes(String(c));
			if (e.endsWith("_id") && e !== "id") return String(n[e]) === String(c);
		}
		return !0;
	});
}
function c({ fields: t, onSave: c, title: l, parentValues: u }) {
	let [d, f] = n(() => {
		let e = {};
		return t.forEach((t) => {
			e[t.name] = a(t);
		}), e;
	}), [p, m] = n(!1), [h, g] = n({}), _ = e((e, n) => {
		f((r) => {
			let i = {
				...r,
				[e]: n
			};
			return t.forEach((t) => {
				t.depend_on === e && (i[t.name] = a(t));
			}), i;
		}), g((t) => {
			let n = { ...t };
			return delete n[e], n;
		});
	}, [t]), v = e((e, t) => {
		f((n) => {
			let r = n[e] || [], i = String(t), a = r.map(String).includes(i);
			return {
				...n,
				[e]: a ? r.filter((e) => String(e) !== i) : [...r, t]
			};
		});
	}, []), y = () => {
		let e = {};
		return t.forEach((t) => {
			if (!t.is_required) return;
			let n = d[t.name];
			(n === "" || n == null) && (e[t.name] = "Required field"), t.value_type === "ARRAY" && Array.isArray(n) && n.length === 0 && (e[t.name] = "Select at least one option");
		}), g(e), Object.keys(e).length === 0;
	}, b = async () => {
		if (y()) {
			m(!0);
			try {
				await c({ values: t.map((e) => ({
					name: e.name,
					value: d[e.name]
				})) });
			} finally {
				m(!1);
			}
		}
	}, x = (e) => {
		let n = d[e.name], a = s(e, t, d, u);
		if (e.value_type === "BOOLEAN") return /* @__PURE__ */ i("label", {
			className: "df-checkbox-label",
			children: [/* @__PURE__ */ r("input", {
				type: "checkbox",
				checked: !!n,
				onChange: (t) => _(e.name, t.target.checked)
			}), /* @__PURE__ */ r("span", {
				className: "df-checkbox-text",
				children: e.label
			})]
		});
		if (e.value_type === "DATETIME") return /* @__PURE__ */ r("input", {
			type: "datetime-local",
			className: "df-input",
			value: String(n || ""),
			onChange: (t) => _(e.name, t.target.value)
		});
		if (e.value_type === "ARRAY" && a) {
			let t = n || [];
			return /* @__PURE__ */ r("div", {
				className: "df-chips-container",
				children: a.map((n) => {
					let i = typeof n.value == "object" ? String(o(n.value)) : n.value;
					return /* @__PURE__ */ r("button", {
						type: "button",
						className: `df-chip ${t.map(String).includes(String(i)) ? "df-chip--selected" : ""}`,
						onClick: () => v(e.name, i),
						children: n.label
					}, String(i));
				})
			});
		}
		if (a && a.length > 0) return /* @__PURE__ */ i("select", {
			className: "df-select",
			value: String(n ?? ""),
			onChange: (t) => _(e.name, t.target.value),
			children: [/* @__PURE__ */ r("option", {
				value: "",
				children: "— Select —"
			}), a.map((e) => {
				let t = typeof e.value == "object" ? String(o(e.value)) : String(e.value ?? "");
				return /* @__PURE__ */ r("option", {
					value: t,
					children: e.label
				}, t);
			})]
		});
		if (e.options && e.depend_on && a && a.length === 0) return /* @__PURE__ */ r("select", {
			className: "df-select",
			disabled: !0,
			children: /* @__PURE__ */ r("option", { children: "— Select parent first —" })
		});
		let c = [
			"INTEGER",
			"BIGINT",
			"FLOAT",
			"DOUBLE PRECISION"
		].includes(e.value_type);
		return /* @__PURE__ */ r("input", {
			type: c ? "number" : "text",
			className: "df-input",
			value: String(n ?? ""),
			onChange: (t) => _(e.name, c ? t.target.value === "" ? "" : Number(t.target.value) : t.target.value),
			placeholder: e.label
		});
	};
	return /* @__PURE__ */ i("div", {
		className: "df-container",
		children: [
			l && /* @__PURE__ */ r("h3", {
				className: "df-title",
				children: l
			}),
			/* @__PURE__ */ r("div", {
				className: "df-fields",
				children: t.map((e) => /* @__PURE__ */ i("div", {
					className: "df-field",
					children: [
						e.value_type !== "BOOLEAN" && /* @__PURE__ */ i("label", {
							className: "df-label",
							children: [e.label, e.is_required && /* @__PURE__ */ r("span", {
								className: "df-required",
								children: "*"
							})]
						}),
						x(e),
						h[e.name] && /* @__PURE__ */ r("span", {
							className: "df-error",
							children: h[e.name]
						})
					]
				}, e.name))
			}),
			/* @__PURE__ */ r("button", {
				className: "df-save-btn",
				onClick: b,
				disabled: p,
				children: p ? "Saving..." : "Save"
			})
		]
	});
}
//#endregion
//#region src/components/TemplateGroup/TemplateGroup.tsx
function l({ fetchTemplates: t, onSave: a }) {
	let [o, s] = n(null), [c, l] = n(""), [u, d] = n(null), [f, p] = n([]), [m, h] = n(!1), [g, _] = n(!1), [v, y] = n({}), b = e(async () => {
		h(!0);
		try {
			s(await t());
		} finally {
			h(!1);
		}
	}, [t]), x = () => {
		o || b();
	}, S = () => {
		p((e) => [...e, {
			templateId: null,
			adTemplateIds: []
		}]);
	}, C = (e) => {
		p((t) => t.filter((t, n) => n !== e));
	}, w = (e, t) => {
		p((n) => n.map((n, r) => r === e ? {
			...n,
			templateId: t
		} : n));
	}, T = (e) => {
		p((t) => t.map((t, n) => n === e ? {
			...t,
			adTemplateIds: [...t.adTemplateIds, null]
		} : t));
	}, E = (e, t) => {
		p((n) => n.map((n, r) => r === e ? {
			...n,
			adTemplateIds: n.adTemplateIds.filter((e, n) => n !== t)
		} : n));
	}, D = (e, t, n) => {
		p((r) => r.map((r, i) => i === e ? {
			...r,
			adTemplateIds: r.adTemplateIds.map((e, r) => r === t ? n : e)
		} : r));
	}, O = () => {
		let e = {};
		return c.trim() || (e.groupName = "Group name is required"), u || (e.campaign = "Select a campaign template"), f.length === 0 && (e.adsets = "Add at least one Ad Set"), f.forEach((t, n) => {
			t.templateId || (e[`adset_${n}`] = "Select an adset template"), t.adTemplateIds.length === 0 && (e[`adset_${n}_ads`] = "Add at least one ad"), t.adTemplateIds.forEach((t, r) => {
				t || (e[`adset_${n}_ad_${r}`] = "Select an ad template");
			});
		}), y(e), Object.keys(e).length === 0;
	};
	return o ? /* @__PURE__ */ i("div", {
		className: "tg-container",
		children: [
			/* @__PURE__ */ r("h3", {
				className: "tg-title",
				children: "Template Group"
			}),
			/* @__PURE__ */ i("div", {
				className: "tg-field",
				children: [
					/* @__PURE__ */ i("label", {
						className: "tg-label",
						children: ["Group Name ", /* @__PURE__ */ r("span", {
							className: "tg-required",
							children: "*"
						})]
					}),
					/* @__PURE__ */ r("input", {
						className: "tg-input",
						value: c,
						onChange: (e) => l(e.target.value),
						placeholder: "Enter group name"
					}),
					v.groupName && /* @__PURE__ */ r("span", {
						className: "tg-error",
						children: v.groupName
					})
				]
			}),
			/* @__PURE__ */ i("div", {
				className: "tg-field",
				children: [
					/* @__PURE__ */ i("label", {
						className: "tg-label",
						children: ["Campaign Template ", /* @__PURE__ */ r("span", {
							className: "tg-required",
							children: "*"
						})]
					}),
					/* @__PURE__ */ i("select", {
						className: "tg-select",
						value: u ?? "",
						onChange: (e) => d(Number(e.target.value)),
						children: [/* @__PURE__ */ r("option", {
							value: "",
							children: "— Select Campaign —"
						}), o.campaign_templates.map((e) => /* @__PURE__ */ r("option", {
							value: e.id,
							children: e.name
						}, e.id))]
					}),
					v.campaign && /* @__PURE__ */ r("span", {
						className: "tg-error",
						children: v.campaign
					})
				]
			}),
			u && /* @__PURE__ */ i("div", {
				className: "tg-tree",
				children: [/* @__PURE__ */ i("div", {
					className: "tg-campaign-node",
					children: [/* @__PURE__ */ r("span", {
						className: "tg-node-badge tg-badge-campaign",
						children: "Campaign"
					}), /* @__PURE__ */ r("span", {
						className: "tg-node-name",
						children: ((e, t) => e?.find((e) => e.id === t)?.name ?? "")(o.campaign_templates, u)
					})]
				}), /* @__PURE__ */ i("div", {
					className: "tg-adsets",
					children: [
						f.map((e, t) => /* @__PURE__ */ i("div", {
							className: "tg-adset-block",
							children: [
								/* @__PURE__ */ i("div", {
									className: "tg-adset-header",
									children: [
										/* @__PURE__ */ i("span", {
											className: "tg-node-badge tg-badge-adset",
											children: ["Ad Set #", t + 1]
										}),
										/* @__PURE__ */ i("select", {
											className: "tg-select tg-select-inline",
											value: e.templateId ?? "",
											onChange: (e) => w(t, Number(e.target.value)),
											children: [/* @__PURE__ */ r("option", {
												value: "",
												children: "— Select Adset —"
											}), o.adset_templates.map((e) => /* @__PURE__ */ r("option", {
												value: e.id,
												children: e.name
											}, e.id))]
										}),
										/* @__PURE__ */ r("button", {
											className: "tg-remove-btn",
											onClick: () => C(t),
											title: "Remove Ad Set",
											children: "✕"
										})
									]
								}),
								v[`adset_${t}`] && /* @__PURE__ */ r("span", {
									className: "tg-error",
									children: v[`adset_${t}`]
								}),
								/* @__PURE__ */ i("div", {
									className: "tg-ads",
									children: [
										e.adTemplateIds.map((e, n) => /* @__PURE__ */ i("div", {
											className: "tg-ad-row",
											children: [
												/* @__PURE__ */ i("span", {
													className: "tg-node-badge tg-badge-ad",
													children: ["Ad #", n + 1]
												}),
												/* @__PURE__ */ i("select", {
													className: "tg-select tg-select-inline",
													value: e ?? "",
													onChange: (e) => D(t, n, Number(e.target.value)),
													children: [/* @__PURE__ */ r("option", {
														value: "",
														children: "— Select Ad —"
													}), o.ad_templates.map((e) => /* @__PURE__ */ r("option", {
														value: e.id,
														children: e.name
													}, e.id))]
												}),
												/* @__PURE__ */ r("button", {
													className: "tg-remove-btn",
													onClick: () => E(t, n),
													title: "Remove Ad",
													children: "✕"
												}),
												v[`adset_${t}_ad_${n}`] && /* @__PURE__ */ r("span", {
													className: "tg-error",
													children: v[`adset_${t}_ad_${n}`]
												})
											]
										}, n)),
										/* @__PURE__ */ r("button", {
											className: "tg-add-btn tg-add-btn--small",
											onClick: () => T(t),
											children: "+ Add Ad"
										}),
										v[`adset_${t}_ads`] && /* @__PURE__ */ r("span", {
											className: "tg-error",
											children: v[`adset_${t}_ads`]
										})
									]
								})
							]
						}, t)),
						/* @__PURE__ */ r("button", {
							className: "tg-add-btn",
							onClick: S,
							children: "+ Add Ad Set"
						}),
						v.adsets && /* @__PURE__ */ r("span", {
							className: "tg-error",
							children: v.adsets
						})
					]
				})]
			}),
			/* @__PURE__ */ r("button", {
				className: "tg-save-btn",
				onClick: async () => {
					if (O()) {
						_(!0);
						try {
							await a({
								templates_group_name: c,
								campaign_template_id: u,
								adset_templates: f.map((e) => ({
									adset_template_id: e.templateId,
									ad_templates: e.adTemplateIds.map((e) => ({ ad_template_id: e }))
								}))
							});
						} finally {
							_(!1);
						}
					}
				},
				disabled: g,
				children: g ? "Saving..." : "Save Template Group"
			})
		]
	}) : /* @__PURE__ */ r("div", {
		className: "tg-container",
		children: /* @__PURE__ */ r("button", {
			className: "tg-load-btn",
			onClick: x,
			disabled: m,
			children: m ? "Loading..." : "Load Templates"
		})
	});
}
//#endregion
//#region src/components/LaunchGroup/LaunchGroup.tsx
function u(e) {
	return e && typeof e == "object" && "id" in e ? e.id : e;
}
function d(e, t, n, r) {
	if (!e.options) return [];
	if (!e.depend_on) return e.options;
	let i = {
		...r,
		...n
	}[e.depend_on];
	if (i === void 0 || i === "" || i === null) return [];
	let a = [...t].find((t) => t.name === e.depend_on), o = i;
	if (a?.options) {
		let e = a.options.find((e) => String(u(e.value)) === String(i));
		e && (o = u(e.value));
	}
	return e.options.filter((e) => {
		if (!e.value || typeof e.value != "object") return !0;
		let t = e.value;
		for (let e of Object.keys(t)) if (e !== "id") {
			if (e.endsWith("_ids") && Array.isArray(t[e])) return t[e].map(String).includes(String(o));
			if (e.endsWith("_id")) return String(t[e]) === String(o);
		}
		return !0;
	});
}
function f(e, t, n, r) {
	let i = {}, a = e.campaignValues[t.groupIndex] ?? {};
	if (Object.assign(i, a), (t.level === "adset" || t.level === "ad") && t.adsetIndex !== void 0) {
		let n = e.adsetValues[t.groupIndex]?.[t.adsetIndex] ?? {};
		Object.assign(i, n);
	}
	return i;
}
function p({ fetchTemplateGroups: a, fetchCampaignFields: o, fetchAdsetFields: s, fetchAdFields: c, onSave: l }) {
	let [p, m] = n(null), [h, g] = n([]), [_, v] = n([]), [y, b] = n([]), [x, S] = n([]), [C, w] = n(!1), [T, E] = n(!1), D = e(async () => {
		w(!0);
		try {
			let [e, t, n, r] = await Promise.all([
				a(),
				o(),
				s(),
				c()
			]);
			g(t), v(n), b(r), m({
				groups: e,
				campaignValues: e.map(() => ({})),
				adsetValues: e.map((e) => e.adset_templates.map(() => ({}))),
				adValues: e.map((e) => e.adset_templates.map((e) => e.ad_templates.map(() => ({}))))
			});
		} finally {
			w(!1);
		}
	}, [
		a,
		o,
		s,
		c
	]), O = e((e) => x.some((t) => t.groupIndex === e.groupIndex && t.adsetIndex === e.adsetIndex && t.adIndex === e.adIndex && t.level === e.level), [x]), k = e((e) => {
		S((t) => t.some((t) => t.groupIndex === e.groupIndex && t.adsetIndex === e.adsetIndex && t.adIndex === e.adIndex && t.level === e.level) ? t.filter((t) => !(t.groupIndex === e.groupIndex && t.adsetIndex === e.adsetIndex && t.adIndex === e.adIndex && t.level === e.level)) : [...t, e]);
	}, []), A = e((e) => {
		if (!p) return;
		let t = [];
		p.groups.forEach((n, r) => {
			e === "campaign" && t.push({
				groupIndex: r,
				level: "campaign"
			}), n.adset_templates.forEach((i, a) => {
				e === "adset" && t.push({
					groupIndex: r,
					adsetIndex: a,
					level: "adset"
				}), e === "ad" && n.adset_templates[a].ad_templates.forEach((e, n) => {
					t.push({
						groupIndex: r,
						adsetIndex: a,
						adIndex: n,
						level: "ad"
					});
				});
			});
		}), S((n) => t.every((e) => n.some((t) => t.groupIndex === e.groupIndex && t.adsetIndex === e.adsetIndex && t.adIndex === e.adIndex && t.level === e.level)) ? n.filter((t) => t.level !== e) : [...n.filter((t) => t.level !== e), ...t]);
	}, [p]), j = e((e, t) => {
		p && m((n) => {
			if (!n) return n;
			let r = { ...n }, i = r.campaignValues.map((e) => ({ ...e })), a = r.adsetValues.map((e) => e.map((e) => ({ ...e }))), o = r.adValues.map((e) => e.map((e) => e.map((e) => ({ ...e }))));
			for (let n of x) n.level === "campaign" ? (i[n.groupIndex][e] = t, h.filter((t) => t.depend_on === e).forEach((e) => {
				i[n.groupIndex][e.name] = "";
			}), _.filter((t) => t.depend_on === e).forEach((e) => {
				a[n.groupIndex].forEach((t) => {
					t[e.name] = "";
				});
			}), y.filter((t) => t.depend_on === e).forEach((e) => {
				o[n.groupIndex].forEach((t) => {
					t.forEach((t) => {
						t[e.name] = "";
					});
				});
			})) : n.level === "adset" && n.adsetIndex !== void 0 ? (a[n.groupIndex][n.adsetIndex][e] = t, [..._, ...y].filter((t) => t.depend_on === e).forEach((e) => {
				_.includes(e) && (a[n.groupIndex][n.adsetIndex][e.name] = "");
			})) : n.level === "ad" && n.adsetIndex !== void 0 && n.adIndex !== void 0 && (o[n.groupIndex][n.adsetIndex][n.adIndex][e] = t);
			return {
				...r,
				campaignValues: i,
				adsetValues: a,
				adValues: o
			};
		});
	}, [
		p,
		x,
		h,
		_,
		y
	]), M = t(() => {
		if (x.length === 0) return null;
		let e = new Set(x.map((e) => e.level));
		return e.size === 1 ? [...e][0] : null;
	}, [x]), N = t(() => M === "campaign" ? h : M === "adset" ? _ : M === "ad" ? y : [], [
		M,
		h,
		_,
		y
	]), P = t(() => [
		...h,
		..._,
		...y
	], [
		h,
		_,
		y
	]), F = t(() => {
		if (!p || x.length === 0) return {};
		let e = x[0];
		return e.level === "campaign" ? p.campaignValues[e.groupIndex] ?? {} : e.level === "adset" && e.adsetIndex !== void 0 ? p.adsetValues[e.groupIndex]?.[e.adsetIndex] ?? {} : e.level === "ad" && e.adsetIndex !== void 0 && e.adIndex !== void 0 ? p.adValues[e.groupIndex]?.[e.adsetIndex]?.[e.adIndex] ?? {} : {};
	}, [p, x]), I = t(() => !p || x.length === 0 ? {} : f(p, x[0], h, _), [
		p,
		x,
		h,
		_
	]);
	return p ? /* @__PURE__ */ i("div", {
		className: "lg-container",
		children: [
			/* @__PURE__ */ i("div", {
				className: "lg-header",
				children: [/* @__PURE__ */ r("h3", {
					className: "lg-title",
					children: "Launch Groups"
				}), /* @__PURE__ */ i("div", {
					className: "lg-select-all-bar",
					children: [
						/* @__PURE__ */ r("button", {
							className: `lg-select-all-btn ${M === "campaign" ? "lg-select-all-btn--active" : ""}`,
							onClick: () => A("campaign"),
							children: "Select All Campaigns"
						}),
						/* @__PURE__ */ r("button", {
							className: `lg-select-all-btn ${M === "adset" ? "lg-select-all-btn--active" : ""}`,
							onClick: () => A("adset"),
							children: "Select All Ad Sets"
						}),
						/* @__PURE__ */ r("button", {
							className: `lg-select-all-btn ${M === "ad" ? "lg-select-all-btn--active" : ""}`,
							onClick: () => A("ad"),
							children: "Select All Ads"
						}),
						x.length > 0 && /* @__PURE__ */ i("button", {
							className: "lg-clear-btn",
							onClick: () => S([]),
							children: [
								"Clear (",
								x.length,
								")"
							]
						})
					]
				})]
			}),
			/* @__PURE__ */ i("div", {
				className: "lg-layout",
				children: [/* @__PURE__ */ r("div", {
					className: "lg-tree-panel",
					children: p.groups.map((e, t) => /* @__PURE__ */ i("div", {
						className: "lg-group-block",
						children: [
							/* @__PURE__ */ r("div", {
								className: "lg-group-name",
								children: e.templates_group_name
							}),
							/* @__PURE__ */ i("div", {
								className: `lg-node lg-node-campaign ${O({
									groupIndex: t,
									level: "campaign"
								}) ? "lg-node--selected" : ""}`,
								onClick: () => k({
									groupIndex: t,
									level: "campaign"
								}),
								children: [
									/* @__PURE__ */ r("span", {
										className: "lg-badge lg-badge-campaign",
										children: "Campaign"
									}),
									/* @__PURE__ */ i("span", {
										className: "lg-node-id",
										children: ["Template #", e.campaign_template_id]
									}),
									Object.keys(p.campaignValues[t] || {}).filter((e) => p.campaignValues[t][e] !== "" && p.campaignValues[t][e] !== void 0).length > 0 && /* @__PURE__ */ r("span", { className: "lg-filled-indicator" })
								]
							}),
							/* @__PURE__ */ r("div", {
								className: "lg-adsets-list",
								children: e.adset_templates.map((e, n) => /* @__PURE__ */ i("div", {
									className: "lg-adset-block",
									children: [/* @__PURE__ */ i("div", {
										className: `lg-node lg-node-adset ${O({
											groupIndex: t,
											adsetIndex: n,
											level: "adset"
										}) ? "lg-node--selected" : ""}`,
										onClick: () => k({
											groupIndex: t,
											adsetIndex: n,
											level: "adset"
										}),
										children: [
											/* @__PURE__ */ r("span", {
												className: "lg-badge lg-badge-adset",
												children: "Ad Set"
											}),
											/* @__PURE__ */ i("span", {
												className: "lg-node-id",
												children: ["Template #", e.adset_template_id]
											}),
											Object.keys(p.adsetValues[t]?.[n] || {}).filter((e) => p.adsetValues[t][n][e] !== "" && p.adsetValues[t][n][e] !== void 0).length > 0 && /* @__PURE__ */ r("span", { className: "lg-filled-indicator" })
										]
									}), /* @__PURE__ */ r("div", {
										className: "lg-ads-list",
										children: e.ad_templates.map((e, a) => /* @__PURE__ */ i("div", {
											className: `lg-node lg-node-ad ${O({
												groupIndex: t,
												adsetIndex: n,
												adIndex: a,
												level: "ad"
											}) ? "lg-node--selected" : ""}`,
											onClick: () => k({
												groupIndex: t,
												adsetIndex: n,
												adIndex: a,
												level: "ad"
											}),
											children: [
												/* @__PURE__ */ r("span", {
													className: "lg-badge lg-badge-ad",
													children: "Ad"
												}),
												/* @__PURE__ */ i("span", {
													className: "lg-node-id",
													children: ["Template #", e.ad_template_id]
												}),
												Object.keys(p.adValues[t]?.[n]?.[a] || {}).filter((e) => p.adValues[t][n][a][e] !== "" && p.adValues[t][n][a][e] !== void 0).length > 0 && /* @__PURE__ */ r("span", { className: "lg-filled-indicator" })
											]
										}, a))
									})]
								}, n))
							})
						]
					}, t))
				}), /* @__PURE__ */ i("div", {
					className: "lg-form-panel",
					children: [
						x.length === 0 && /* @__PURE__ */ r("div", {
							className: "lg-placeholder",
							children: "Select one or more nodes to edit their parameters"
						}),
						x.length > 0 && !M && /* @__PURE__ */ r("div", {
							className: "lg-placeholder",
							children: "Select nodes of the same level to bulk edit"
						}),
						M && N.length > 0 && /* @__PURE__ */ i("div", {
							className: "lg-form",
							children: [/* @__PURE__ */ i("div", {
								className: "lg-form-header",
								children: [
									"Editing ",
									x.length,
									" ",
									M,
									"(s)"
								]
							}), /* @__PURE__ */ r("div", {
								className: "lg-form-fields",
								children: N.map((e) => {
									let t = F[e.name] ?? "", n = d(e, P, F, I);
									return /* @__PURE__ */ i("div", {
										className: "lg-field",
										children: [/* @__PURE__ */ i("label", {
											className: "lg-label",
											children: [
												e.label,
												e.is_required && /* @__PURE__ */ r("span", {
													className: "lg-required",
													children: "*"
												}),
												e.depend_on && /* @__PURE__ */ i("span", {
													className: "lg-depend-tag",
													children: ["depends on: ", e.depend_on]
												})
											]
										}), e.value_type === "BOOLEAN" ? /* @__PURE__ */ i("label", {
											className: "lg-checkbox-label",
											children: [/* @__PURE__ */ r("input", {
												type: "checkbox",
												checked: !!t,
												onChange: (t) => j(e.name, t.target.checked)
											}), /* @__PURE__ */ r("span", { children: e.label })]
										}) : e.value_type === "DATETIME" ? /* @__PURE__ */ r("input", {
											type: "datetime-local",
											className: "lg-input",
											value: String(t || ""),
											onChange: (t) => j(e.name, t.target.value)
										}) : e.value_type === "ARRAY" && n.length > 0 ? /* @__PURE__ */ r("div", {
											className: "lg-chips",
											children: n.map((n) => {
												let i = typeof n.value == "object" ? String(u(n.value)) : String(n.value), a = Array.isArray(t) ? t : [], o = a.map(String).includes(i);
												return /* @__PURE__ */ r("button", {
													type: "button",
													className: `lg-chip ${o ? "lg-chip--selected" : ""}`,
													onClick: () => {
														let t = o ? a.filter((e) => String(e) !== i) : [...a, n.value];
														j(e.name, t);
													},
													children: n.label
												}, i);
											})
										}) : n.length > 0 ? /* @__PURE__ */ i("select", {
											className: "lg-select",
											value: String(t ?? ""),
											onChange: (t) => j(e.name, t.target.value),
											children: [/* @__PURE__ */ r("option", {
												value: "",
												children: "— Select —"
											}), n.map((e) => {
												let t = typeof e.value == "object" ? String(u(e.value)) : String(e.value ?? "");
												return /* @__PURE__ */ r("option", {
													value: t,
													children: e.label
												}, t);
											})]
										}) : e.options && e.depend_on ? /* @__PURE__ */ r("select", {
											className: "lg-select",
											disabled: !0,
											children: /* @__PURE__ */ r("option", { children: "— Select parent first —" })
										}) : /* @__PURE__ */ r("input", {
											type: [
												"INTEGER",
												"BIGINT",
												"FLOAT",
												"DOUBLE PRECISION"
											].includes(e.value_type) ? "number" : "text",
											className: "lg-input",
											value: String(t ?? ""),
											onChange: (t) => j(e.name, t.target.value),
											placeholder: e.label
										})]
									}, e.name);
								})
							})]
						})
					]
				})]
			}),
			/* @__PURE__ */ r("button", {
				className: "lg-save-btn",
				onClick: async () => {
					if (p) {
						E(!0);
						try {
							await l(p.groups.map((e, t) => ({
								templates_group_name: e.templates_group_name,
								campaign_template_id: e.campaign_template_id,
								...p.campaignValues[t],
								adset_templates: e.adset_templates.map((e, n) => ({
									adset_template_id: e.adset_template_id,
									...p.adsetValues[t][n],
									ad_templates: e.ad_templates.map((e, r) => ({
										ad_template_id: e.ad_template_id,
										...p.adValues[t][n][r]
									}))
								}))
							})));
						} finally {
							E(!1);
						}
					}
				},
				disabled: T,
				children: T ? "Saving..." : "Save All Launch Groups"
			})
		]
	}) : /* @__PURE__ */ r("div", {
		className: "lg-container",
		children: /* @__PURE__ */ r("button", {
			className: "lg-load-btn",
			onClick: D,
			disabled: C,
			children: C ? "Loading..." : "Load Launch Data"
		})
	});
}
//#endregion
export { c as DynamicForm, p as LaunchGroup, l as TemplateGroup };
